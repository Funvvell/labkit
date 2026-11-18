# DecodeSdpcDll.dll

This directory must contain `DecodeSdpcDll.dll` **and all of its dependency
DLLs** (`avcodec-58.dll`, `avformat-58.dll`, `avutil-56.dll`, `swscale-5.dll`,
`swresample-3.dll`, `avfilter-7.dll`, `avdevice-58.dll`, `postproc-55.dll`,
…) copied verbatim from:

```
<python>/Lib/site-packages/sdpc/WINDOWS/dll/
```

Installed via `pip install sdpc-for-python`. `DecodeSdpcDll.dll` is a
closed-source Windows x64 library; the Rust application loads it at runtime
through FFI. It is not thread-safe and must not be unloaded.

The binaries are intentionally git-ignored. Development builds can point
`SDPC_DLL_DIR` at the site-packages directory instead of copying them here.
