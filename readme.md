# 终端打开默认是cmd

如果你希望在终端中默认使用 CMD（而不是 PowerShell）作为命令行终端，你可以按照以下步骤来更改设置：
1. 更改 Windows Terminal 设置

如果你使用的是 Windows Terminal（新的终端应用），你可以通过更改配置文件来设置默认终端为 CMD。
步骤：

    打开 Windows Terminal。
    点击 下拉菜单（在窗口顶部的标签旁边，通常是三个点 ...），然后选择 Settings。
    在设置界面中，选择左侧的 Profiles，然后点击 Defaults 或 Startup，取决于你的版本。
    找到 Default profile 设置，点击下拉菜单，选择 Command Prom
notepad $PROFILE
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

这条命令设置了 PowerShell 输出的编码为 UTF-8，这样就能正确显示中文字符。

在 CMD 中设置输出编码 如果你使用的是 CMD（命令提示符），你应该使用 chcp 命令来设置编码为 UTF-8：

chcp 65001