// ============================================================
// 虚拟按键：手机模拟键盘（Cocos Creator 2.x）
// 适用：游戏需要键盘（WASD/方向键移动、Shift 跑、空格交互等），手机没有物理键盘。
// 原理：游戏监听引擎键盘事件（cc.systemEvent），电脑键盘从这里进游戏，
//       虚拟按键也从这里进 —— 走引擎事件总线，而非浏览器 DOM。
//
// 坑：千万别往浏览器 DOM 发合成 KeyboardEvent —— 手机上游戏引擎根本不监听
//     DOM 键盘事件（引擎认为手机没物理键盘），信号发出去没人收。
// ============================================================

// --- 页面层注入（index.html 的 </body> 前）---

// 1) 画按钮（固定定位、高 z-index、半透明，不挡游戏画面太多）
function mkBtn(label, w, h, style) {
  var b = document.createElement('div');
  b.textContent = label;
  b.style.cssText =
    'position:absolute;width:' + w + 'px;height:' + h + 'px;' +
    'border-radius:12px;background:rgba(255,255,255,.16);color:#fff;' +
    'font-size:26px;display:flex;align-items:center;justify-content:center;' +
    'border:1px solid rgba(255,255,255,.35);' +
    'pointer-events:auto;touch-action:none;' + (style || '');
  return b;
}
// 根容器：pointer-events:none（不挡游戏），按钮各自 pointer-events:auto
var root = document.createElement('div');
root.style.cssText =
  'position:fixed;left:0;bottom:0;width:100%;height:170px;' +
  'z-index:99999;display:none;pointer-events:none;touch-action:none;user-select:none;';
document.body.appendChild(root);
// 左下角十字方向键 + 右下角 Shift（示例布局）
var up = mkBtn('↑', 60, 60, 'left:65px;top:0;');
var left = mkBtn('←', 60, 60, 'left:0;top:65px;');
var down = mkBtn('↓', 60, 60, 'left:65px;top:65px;');
var right = mkBtn('→', 60, 60, 'left:130px;top:65px;');
var shift = mkBtn('跑', 90, 90, 'right:18px;bottom:18px;border-radius:50%;');
root.appendChild(up); root.appendChild(left); root.appendChild(down);
root.appendChild(right); root.appendChild(shift);

// 2) 核心：向引擎键盘通道发事件
function keyEv(type, keyCode) {
  var evType = (type === 'keydown')
    ? cc.SystemEvent.EventType.KEY_DOWN
    : cc.SystemEvent.EventType.KEY_UP;
  cc.systemEvent.emit(evType, { keyCode: keyCode, preventDefault: function () {} });
}

// 3) 绑定：按住 = 按下一次（引擎记录按键状态，每帧读取 → 持续移动）
//          松开 = 抬起（清除按键状态 → 停止）
function bindKey(el, keyCode) {
  var on = false;
  el.addEventListener('touchstart', function () { if (!on) { on = true; keyEv('keydown', keyCode); } }, { passive: false });
  el.addEventListener('touchend',   function () { if (on) { on = false; keyEv('keyup',   keyCode); } });
  el.addEventListener('touchcancel',function () { if (on) { on = false; keyEv('keyup',   keyCode); } });
}

// 4) 按键码：方向键 37/38/39/40，Shift=16，WASD=87/65/83/68
bindKey(up, 38); bindKey(down, 40); bindKey(left, 37); bindKey(right, 39);
bindKey(shift, 16);

// 5) 手机才显示（等引擎加载完判断）
function isMobileUA() { return /Android|iPhone|iPod|iPad|Mobile/i.test(navigator.userAgent); }
var tries = 0;
var t = setInterval(function () {
  if ((cc && cc.sys && cc.sys.isMobile) || isMobileUA()) { clearInterval(t); root.style.display = 'block'; }
  else if (++tries > 40) { clearInterval(t); if (isMobileUA()) root.style.display = 'block'; }
}, 500);

// --- 其他引擎的键盘通道 ---
// Cocos Creator 3.x:  input.emit(Input.EventType.KEY_DOWN, { keyCode })
// Unity WebGL:       通常内置触摸；键盘用 Input.GetKey 体系，可能需要特殊处理
// 纯 HTML5:          看代码监听什么（keydown 或引擎封装）
