# playcanvas-template

This template uses playcanvas-sync as an interface between playcanvas editor and local setup. It's not perfect, but it is as real-time as it can get currently with their api limitations. It's not mandatory to use the editor, the work can be done with just engine, but I want to use it to the fullest so I'm using both in the template.

First download it from https://github.com/playcanvas/playcanvas-sync  and go through installation. [https://playcanvas.com/account](https://playcanvas.com/account) is where you get your api key.

For some reason the sync script uses absolute directory, so the easiest way to make it work is to save the `.pcconfig`  file in your computer's home directory `/`.

Navigate to the dist folder directory you want to dedicate to playcanvas projects, do a process.cwd() and copy the path to "PLAYCANVAS_TARGET_DIR" setting in `pcconfig`. 

After that just run `npm run watch` and it should work properly from there on.