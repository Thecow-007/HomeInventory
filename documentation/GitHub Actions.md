This document will serve as a guide for setting up GitHub actions for a repo, so that on a commit to "prod" then the server will compose down and up, with the new code.

## Step 1 - Deploy Yaml
- The first step is the script that tells the runner what do to while its being run.
- Create a file `.github/workflowss/deploy.yaml`:
```yml
name: [name of deployment]

on:
  push:
    branches:
      - prod

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - name: Update Code and Redeploy
        #execute all commands from project's directory
        working-directory: [location] (like /home/homeadmin/subApps/...)
        run: |
          # Pull the latest code from the main branch
          git fetch origin
          git reset --hard origin/prod

          # destroy the current version of the continers without wiping the DB
          docker compose down

          # re-compose the contianers
          docker compose up -d --build
```
- This version above expects the branch to be named "prod".

## Step 2 - Setting up the runner
- Next you'll have to set your server up to run the above code whenever you push to prod.
- Luckily GitHub gives you commands to do this easily.
- Head to the repo's settings - > Actions -> Runners -> Create new Runner -> choose your OS.
- Then it gives you a list of commands and you just need to run those commands.
- Once caveat is that the default folder name is `actions-runner` and you may want to change this if you have multiple runners on the same system.
- You can leave everything as default except for the **Runner Name**. Here you should give it a specific name.

## Step 3 - Run the Runner as a background service
The GitHub instructions usually end with `./run.sh`, but that stops working if you close the terminal. You want it to run forever.
Run these commands instead:
```bash
# Install the service runner
sudo ./svc.sh install

# Start the service
sudo ./svc.sh start

# Check if it's alive
sudo ./svc.sh status
```