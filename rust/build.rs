//! Build script: Tauri codegen + the relative SDPC DLL directory used by the
//! runtime loader when a user keeps an offline copy next to the executable.

use std::path::PathBuf;

fn main() {
    tauri_build::build();

    println!("cargo:rerun-if-changed=sdpc/WINDOWS/dll");
    println!("cargo:rerun-if-env-changed=SDPC_DLL_DIR");

    // The DLL is not bundled: the app downloads the official wheel on first
    // use (see `src/sdpc/download.rs`). A local `sdpc/WINDOWS/dll` next to the
    // exe is still accepted for fully offline deployments.

    // Export the relative DLL directory for the runtime loader.
    let out = PathBuf::from(std::env::var("OUT_DIR").unwrap_or_else(|_| ".".to_string()));
    std::fs::write(out.join("dll_rel_dir.txt"), "sdpc/WINDOWS/dll")
        .expect("failed to write OUT_DIR/dll_rel_dir.txt");
}
