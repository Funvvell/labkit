//! Application-wide error type.

use std::path::PathBuf;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("缺少 SDPC 解码组件 DecodeSdpcDll.dll：{0}")]
    Dll(String),

    #[error("DecodeSdpcDll.dll 版本不匹配，缺少符号 {0}")]
    DllSymbol(String),

    #[error("文件路径无法用 GBK 编码（含 DLL 不支持的字符）：{0}")]
    GbkEncode(String),

    #[error("无法打开切片（文件损坏或非 SDPC 格式）：{0}")]
    OpenFailed(PathBuf),

    #[error("SDPC 元数据解析失败：{0}")]
    Parse(String),

    #[error("DLL 区域解码失败，返回码 {0}")]
    Decode(i32),

    #[error("无效的图像区域：{0}")]
    InvalidRegion(String),

    #[error("切片元数据异常：{0}")]
    BadMetadata(String),

    #[error("TIFF 写入失败：{0}")]
    Tiff(String),

    #[error("IO 错误：{0}")]
    Io(#[from] std::io::Error),

    #[error("JSON 错误：{0}")]
    Json(#[from] serde_json::Error),

    #[error("CSV 错误：{0}")]
    Csv(#[from] csv::Error),

    #[error("qPCR 数据处理失败：{0}")]
    Qpcr(String),

    #[error("操作已取消")]
    Cancelled,

    #[error("{0}")]
    Other(String),
}

pub type Result<T> = std::result::Result<T, AppError>;
