# vendor 组件许可清单

| 文件 | 组件 | 版本 | 许可 |
|---|---|---|---|
| papaparse.min.js | PapaParse | 5.4.1 | MIT |
| xlsx.full.min.js | SheetJS | 0.20.3 | Apache-2.0 |
| tabulator.min.js / tabulator.min.css | Tabulator | 6.3.0 | MIT |
| markdown-it.min.js | markdown-it | 14.1.0 | MIT |
| easytimer.min.js | easytimer.js | 4.6.0 | MIT |
| plotly.min.js | plotly.js-dist-min | 2.35.2 | MIT |
| fabric.min.js | fabric.js | 5.3.0 | MIT |
| simple-statistics.min.js | simple-statistics | 7.8.3 | ISC |
| arquero.min.js | arquero | 8.14.1 | BSD-3-Clause |
| seedrandom.min.js | seedrandom | 3.0.5 | MIT |
| stdlib-stats.bundle.js | stdlib-js 统计子集 | 见 tools/vendor-build/package.json | Apache-2.0 |
| markdown-table.bundle.js | markdown-table | 3.1.0 | MIT |
| openepi/*.js | OpenEpi（MIT，官方声明见 NOTICE.md；含 MartinStats 公有领域模块） | 2026 抓取 | MIT |
| gridstack-all.js / gridstack.min.css | gridstack.js（UMD 原样引入，版权行见 NOTICE.md） | 14.1.1 | MIT（全文见 gridstack-LICENSE.txt） |
| ../fonts/InterVariable.woff2 | Inter 变量字体子集（rsms/inter，经官方 npm 包 inter-ui） | 4.1.0 | OFL-1.1（全文见 ../fonts/Inter-OFL.txt） |
| ../fonts/JetBrainsMono-Regular.woff2 / -Bold.woff2 | JetBrains Mono 子集 | 2.304 | OFL-1.1（全文见 ../fonts/JetBrainsMono-OFL.txt） |

## SIL Open Font License 1.1（Inter / JetBrains Mono）
字体子集由 `tools/font-build/build_fonts.py` 生成（fontTools），只含拉丁/希腊/数学符号，
不含 CJK（中文走系统字体）。来源 URL 与源文件/产物 sha256 见 `frontend/fonts/manifest.json`。
OFL 全文随字体分发：`frontend/fonts/Inter-OFL.txt`、`frontend/fonts/JetBrainsMono-OFL.txt`。
OFL 允许再分发与嵌入应用，要求保留版权与许可声明，且不得单独出售字体本身。

## MIT（通用文本，适用于上表 MIT 组件，版权行见 NOTICE.md）
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## ISC（simple-statistics）
Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## Apache-2.0（stdlib-js / SheetJS）
Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
（stdlib 打包产物内已内联各源文件的原始 Apache 许可注释。）

## BSD-3-Clause（arquero）
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.