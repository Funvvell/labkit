//! Developer probe for the first-run SDPC bootstrap.
//!
//! ```text
//! cargo run --example sdpc_bootstrap
//! ```
//!
//! Exercises the same code path as the Tauri command: resolve PyPI, download,
//! verify SHA-256, extract `WINDOWS/dll` into the user cache.

fn main() {
    println!("cache root: {:?}", labkit::sdpc::download::cache_root());
    match labkit::sdpc::ensure_decoder(|p| {
        println!(
            "stage={} received={} total={}",
            p.stage, p.received, p.total
        );
    }) {
        Ok(dir) => {
            println!("decoder dir: {}", dir.display());
            match labkit::sdpc::loader::load_library() {
                Ok(_) => println!("DecodeSdpcDll.dll loaded, symbols resolved"),
                Err(e) => {
                    eprintln!("DLL load failed: {e}");
                    std::process::exit(1);
                }
            }
        }
        Err(e) => {
            eprintln!("bootstrap failed: {e}");
            std::process::exit(1);
        }
    }
}
