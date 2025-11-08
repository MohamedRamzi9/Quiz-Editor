import os, shutil, stat, subprocess

dir_path = r"lib"

for item in os.listdir(dir_path):
    path = os.path.join(dir_path, item)
    if os.path.isfile(path):
        os.chmod(path, stat.S_IWRITE)
        os.unlink(path)
    else:
        shutil.rmtree(path, onerror=lambda f,p,e: (os.chmod(p, stat.S_IWRITE), f(p)))

command = "git clone https://github.com/MohamedRamzi9/JS-UI-library lib"
subprocess.run(command, shell=True)