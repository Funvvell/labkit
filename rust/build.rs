//! Build script: Tauri codegen + SDPC DLL discovery for the reused decoder.

use std::path::PathBuf;

fn main() {
    tauri_build::build();

    println!("cargo:rerun-if-changed=sdpc/WINDOWS/dll");
    println!("cargo:rerun-if-env-changed=SDPC_DLL_DIR");

    let manifest_dir = PathBuf::from(
        std::env::var("CARGO_MANIFEST_DIR").unwrap_or_else(|_| ".".to_string()),
    );
    let dll_dir = manifest_dir.join("sdpc").join("WINDOWS").join("dll");
    let dll = dll_dir.join("DecodeSdpcDll.dll");

    if !dll.exists() {
        println!(
            "cargo:warning=DecodeSdpcDll.dll not found in {}. Development builds can set \
             SDPC_DLL_DIR to the sdpc-for-python package's WINDOWS/dll directory. \
             Release packages must ship the whole directory next to the exe.",
            dll_dir.display()
        );
    }

    // Export the relative DLL directory for the runtime loader.
    let out = PathBuf::from(std::env::var("OUT_DIR").unwrap_or_else(|_| ".".to_string()));
    std::fs::write(out.join("dll_rel_dir.txt"), "sdpc/WINDOWS/dll")
        .expect("failed to write OUT_DIR/dll_rel_dir.txt");
}
