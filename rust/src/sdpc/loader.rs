//! FFI boundary #2: locating and loading `DecodeSdpcDll.dll`.

#![allow(unsafe_code)]

use std::path::{Path, PathBuf};

use libloading::{Library, Symbol};

use crate::constants::DLL_REL_DIR;
use crate::errors::{AppError, Result};
use crate::sdpc::ffi::{Dll, FnClose, FnDispose, FnGetRoi, FnLayerInfo, FnOpen};

/// Try, in order: explicit env var, directory next to the executable, and
/// the `sdpc-for-python` installation reachable via `python` on PATH.
pub fn find_dll_dir() -> Result<PathBuf> {
    if let Ok(dir) = std::env::var("SDPC_DLL_DIR") {
        let p = PathBuf::from(dir);
        if p.join("DecodeSdpcDll.dll").exists() {
            return Ok(p);
        }
    }

    if let Ok(exe) = std::env::current_exe() {
        if let Some(base) = exe.parent() {
            let p = base.join(DLL_REL_DIR);
            if p.join("DecodeSdpcDll.dll").exists() {
                return Ok(p);
            }
        }
    }

    if let Some(p) = locate_via_python() {
        return Ok(p);
    }

    let candidate = std::env::current_exe()
        .ok()
        .and_then(|e| e.parent().map(|b| b.join(DLL_REL_DIR)))
        .unwrap_or_else(|| PathBuf::from(DLL_REL_DIR));
    Err(AppError::Dll(format!(
        "未找到解码组件。请将 sdpc-for-python 的 WINDOWS/dll 整个目录放到 {}，\
         或设置环境变量 SDPC_DLL_DIR 指向该目录。",
        candidate.display()
    )))
}

fn locate_via_python() -> Option<PathBuf> {
    let code = "import sdpc,pathlib;print(pathlib.Path(sdpc.__file__).parent/'WINDOWS'/'dll')";
    for prog in ["python", "python3", "py"] {
        let out = std::process::Command::new(prog)
            .args(["-c", code])
            .output()
            .ok()?;
        if out.status.success() {
            let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
            let p = PathBuf::from(s);
            if p.join("DecodeSdpcDll.dll").exists() {
                return Some(p);
            }
        }
    }
    None
}

/// Load the library once. Mirrors `reader.py:24-53`: prepend the DLL folder to
/// PATH, chdir into it while calling `LoadLibrary`, then restore the CWD.
pub fn load_library() -> Result<Dll> {
    let dir = find_dll_dir()?;
    let dll_path = dir.join("DecodeSdpcDll.dll");
    if !dll_path.exists() {
        return Err(AppError::Dll(format!("文件不存在: {}", dll_path.display())));
    }

    let old_cwd = std::env::current_dir().ok();
    let old_path = std::env::var("PATH").unwrap_or_default();
    let new_path = format!("{}{}{}", dir.display(), if cfg!(windows) { ";" } else { ":" }, old_path);
    // PATH/CWD 是进程全局状态：持 DLL_LOCK 完成「改环境 → LoadLibrary → 恢复」，
    // 避免与并发 FFI 调用竞态（dll() 的 OnceLock 只保证加载一次，不保证期间无他人）。
    let _guard = crate::sdpc::ffi::DLL_LOCK
        .lock()
        .unwrap_or_else(|e| e.into_inner());
    std::env::set_var("PATH", &new_path);

    let load_result: std::result::Result<Library, String> = (|| {
        std::env::set_current_dir(&dir).map_err(|e| e.to_string())?;
        unsafe { Library::new(&dll_path) }.map_err(|e| e.to_string())
    })();

    // Always restore, even on failure.
    if let Some(cwd) = old_cwd {
        let _ = std::env::set_current_dir(cwd);
    }
    std::env::set_var("PATH", old_path);

    let lib = load_result.map_err(|e| {
        AppError::Dll(format!(
            "加载 {} 失败: {e}。请确认程序为 x64、目录内依赖 DLL 齐全，\
             并已安装 Visual C++ Redistributable x64。",
            dll_path.display()
        ))
    })?;

    // The library must never be unloaded: the decoder keeps global state.
    let lib: &'static Library = Box::leak(Box::new(lib));

    unsafe {
        macro_rules! sym {
            ($name:literal, $ty:ty) => {{
                let s: Symbol<$ty> = lib
                    .get::<$ty>(concat!($name, "\0").as_bytes())
                    .map_err(|_| AppError::DllSymbol($name.to_string()))?;
                *s.into_raw()
            }};
        }

        Ok(Dll {
            open: sym!("SqOpenSdpc", FnOpen),
            close: sym!("SqCloseSdpc", FnClose),
            layer_info: sym!("GetLayerInfo", FnLayerInfo),
            get_roi: sym!("SqGetRoiRgbOfSpecifyLayer", FnGetRoi),
            dispose: sym!("Dispose", FnDispose),
        })
    }
}

/// Helper used by diagnostics / tests.
pub fn dll_file_name() -> &'static str {
    Path::new("DecodeSdpcDll.dll")
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("DecodeSdpcDll.dll")
}
