@echo off
chcp 65001 >nul
title 网页版游戏服务器
cd /d "%~dp0"

echo ============================================
echo   网页版游戏启动器
echo.
echo   启动后请在浏览器打开:
echo     电脑:  http://localhost:8010/index.html
echo     手机:  http://<本机IP>:8010/index.html
echo.
echo   手机IP查看: Win+R → cmd → ipconfig
echo   找"无线局域网适配器 WLAN"的 IPv4 地址
echo   手机打不开先放行防火墙(管理员CMD):
echo   netsh advfirewall firewall add rule name="gameweb" ^
echo       dir=in action=allow protocol=TCP localport=8010
echo.
echo   (关闭本窗口 = 停止服务器)
echo ============================================
echo.

rem 优先用 py -3（Python3），没有就用 python3
where py >nul 2>nul && (set PYCMD=py -3) || (set PYCMD=python3)
%PYCMD% -m http.server 8010 --bind 0.0.0.0
pause
