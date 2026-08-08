// ============================================================
// 触摸转鼠标：给游戏按钮组件加触摸支持（Cocos Creator 2.x）
// 适用：游戏按钮靠"鼠标悬停(mousemove)+按下/抬起(mousedown/mouseup)"工作，
//       手机只有触摸事件，游戏收不到 → 点按钮没反应。
// 做法：找到游戏按钮的事件基础组件（通常是 MouseEvent 组件），
//       加 TOUCH_START/TOUCH_END 监听，把触摸翻译成鼠标。
// ============================================================

// --- ① 按钮基础组件补丁（改游戏打包 JS，字节级替换进对应组件）---
t.prototype.onEnable = function () {
  // 原有鼠标监听...
  this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  this.node.on(cc.Node.EventType.TOUCH_END,   this.onTouchEnd,   this);
},
// 手指按下 → 判断是否按在按钮内 → 相当于"鼠标悬停 + 按下"
t.prototype.onTouchStart = function (e) {
  this.node.activeInHierarchy && (
    this._touched = this.node.getBoundingBoxToWorld().contains(e.getLocation()),
    this._touched && this.fire(/* MOUSE_DOWN */ e)
  )
},
// 手指抬起 → 触发"鼠标抬起" = 完成一次点击
t.prototype.onTouchEnd = function (e) {
  this._touched && this.fire(/* MOUSE_UP */ e),
  this._touched = !1
}

// --- ② 触摸事件补丁（页面 index.html 注入，等 cc 可用后执行）---
// 按钮点击回调里常检查 e.getButton() == 左键，而触摸事件对象没有这个方法，
// 调用会报错中断 → 给触摸事件补上，永远返回左键(0)
if (cc && cc.Event && cc.Event.EventTouch && !cc.Event.EventTouch.prototype.getButton) {
  cc.Event.EventTouch.prototype.getButton = function () { return 0; }; // 0 = 左键
}

// --- 注意事项 ---
// 1. 不要给"全局鼠标层"（全屏透明监听鼠标的节点）转发触摸——容易破坏
//    引擎原生触摸按钮（本来能点的反而点不了）。尽量只改具体按钮组件。
// 2. 每改一处必须手机实测，不要攒着一起改。
// 3. 改之前先备份整个游戏网页目录。
