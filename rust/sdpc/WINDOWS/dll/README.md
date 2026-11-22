# DecodeSdpcDll.dll

Optional offline copy for `SDPC_DLL_DIR` / exe-side deployment. Normal installs
do **not** need this directory: the app downloads the official
`sdpc-for-python` wheel from PyPI on the first `.sdpc` open, verifies SHA-256
and extracts only `sdpc/WINDOWS/dll/*` into:

```
%USERPROFILE%\.liver_portal_crop\decoders\sdpc\<version>\WINDOWS\dll\
```

If you want a fully offline deployment, copy `DecodeSdpcDll.dll` **and all of
its dependency DLLs** (`avcodec-58.dll`, `avformat-58.dll`, `avutil-56.dll`,
`swscale-5.dll`, `swresample-3.dll`, `avfilter-7.dll`, `avdevice-58.dll`,
`postproc-55.dll`, …) here from:

```
<python>/Lib/site-packages/sdpc/WINDOWS/dll/
```

`DecodeSdpcDll.dll` is a closed-source Windows x64 library; the Rust
application loads it at runtime through FFI. It is not thread-safe and must not
be unloaded. The binaries are intentionally git-ignored.
