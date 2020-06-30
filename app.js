var fs = require('fs');
var http = require('http');
var child_process = require('child_process');

var spawn = require('child_process').spawn;
destPath = "./serve/murli_audio.mp3";
srcPath = "http://www.babamurli.com/01.%20Daily%20Murli/01.%20Hindi/10.%20Hindi%20Murli%20-%20Mumbai/datePlaceHolder.mp3";

// functions
startSync = () => {
    if (alreadyDownloadedToday(destPath)) {
        log("No need to download and update... exiting");
        return;
    }
    try {
        downloadAndUpdate();
    } catch (err) {
        log("error " + err);
    }
}


downloadAndUpdate = () => {
    src = getAudioSource(srcPath);
    downloadFile(src, destPath);
}


downloadFile = (src, dest) => {
    var file = fs.createWriteStream(dest);
    console.log("starting");
    var request = http.get(src, function (response) {
        response.pipe(file);
        response.on('end', function () {
            file.end();
            log("Download completed");
            if (alreadyDownloadedToday(destPath)) {
                updateGit();
            } else {
                log("error, not downloaded ");
            }

        });
    });

    return true;
}

updateGit = () => {

    log("updating git...")
    ls = spawn('cmd.exe', ['/c', 'update.bat']);

    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    ls.on('exit', function (code) {
        console.log('child process exited with code ' + code);
    });

}


getAudioSource = (baseUrl) => {
    return baseUrl.replace("datePlaceHolder", getDate());
}

alreadyDownloadedToday = (path) => {
    try {
        if (fs.existsSync(path)) {
            const stats = fs.statSync(path);
            if (new Date().getDate() == stats.mtime.getDate()) {
                return true;
            }
        }
    } catch (err) {
        log("error " + err);
        return false;
    }
}

log = (text) => {
    console.log(text);
}

getDate = () => {
    var today = new Date();
    date = today.getDate();
    month = today.getMonth() + 1;
    year = today.getFullYear();

    if (date.toString().length == 1) {
        date = "0" + String(date);
    }
    if (month.toString().length == 1) {
        month = "0" + String(month);
    }
    return String(date) + "." + String(month) + "." + String(year).substr(2, 2);
}


startSync();