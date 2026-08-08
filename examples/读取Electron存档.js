// ============================================================
// 读取 Electron 套壳游戏的存档（Chromium localStorage / leveldb）
// 适用：游戏是 Electron 壳，存档写在 Chromium 内部存储里
//       （C:/Users/<你>/AppData/Roaming/<应用名>/Local Storage/leveldb），
//       改游戏目录的存档文件无效，必须改这里。
// 依赖：npm install classic-level
// ============================================================
const { ClassicLevel } = require('classic-level');

// Electron 应用的用户数据目录（游戏运行时从任务管理器→进程命令行可看到
// --user-data-dir=... 路径；或直接搜 AppData/Roaming 下的应用文件夹）
const dbPath = 'C:/Users/<你>/AppData/Roaming/<应用名>/Local Storage/leveldb';

async function main() {
  const db = new ClassicLevel(dbPath, { keyEncoding: 'buffer', valueEncoding: 'buffer' });
  await db.open();

  // 遍历所有键，找到存档键（通常包含游戏存档名）
  for await (const [key, value] of db.iterator()) {
    const k = key.toString('latin1');
    if (!k.includes('villagedb')) continue; // 换成你的存档键特征

    // Chrome localStorage 的值格式：1 字节前缀 + UTF-16LE 编码的 JSON 字符串
    const prefix = (value[0] === 0x00 && value[1] === 0x7b) ? 1 : 0;
    const txt = value.slice(prefix).toString('utf16le');
    console.log('KEY:', k, '| len:', txt.length);

    // 解析 / 修改 / 写回示例
    const data = JSON.parse(txt);
    // ... 改 data ...
    const newValue = Buffer.concat([value.slice(0, prefix), Buffer.from(JSON.stringify(data), 'utf16le')]);
    await db.put(key, newValue);
  }
  await db.close();
}

main().catch(e => { console.error(e); process.exit(1); });
