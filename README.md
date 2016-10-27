# When I Work SpreadSheets

I was frustrated with the presentation of shifts on WhenIWork.com 's website 
so I created this server/front-end application using Node and Angular. I created 
it with our team in mind so it works good when it's a fairly small team (~10 people).

Try it out at http://mean.ericdavidking.com

## Getting Started
### Prerequisites
#### WIW Developer Key
In order to get this working for your account you must first sign up for a developer
key at http://www.wheniwork.com.  Copy your developer key into the file:

public/js/var/wiw.json 

as a value for the element "WKey" (the only pair in the object). 

#### Node & NPM

If you're on Ubuntu:
```
sudo apt-get install nodejs npm git
```

Opensuse:
```
sudo zypper install nodejs npm git
```

### Installation
#### Get The Source

You may want to check to make sure you have permission to download the files to your preferred location.
```
git clone https://github.com/cazro/wiw.git 
```
#### Install NPM Dependencies

Enter the directory you cloned the files into and do:
```
npm install
```

### Running
While in the home directory of the WIW app you can start the node server by entering:
```
npm start
```
## Recomendations
#### PM2
I'd recommend using a node process manager to monitor the node server which will restart it in case it crashes.  I use PM2 which can be downloaded with npm by:
``` 
npm install -g pm2
```
#### NGINX
The server starts up and is assigned to port 3000 by default. This means accessing your app by going to "http://domain.com:3000" which can get tiresome and makes it more difficult for people to remember the URL.  With NGINX you can set up a reverse proxy that will forward all your connections going to "http://domain.com" to "http://domain.com:3000".  Setting that up is relatively easy and is beyond the scope of this.

## Screenshots
![Schedule](http://ericdavidking.com/wiw/img/wiw-ss.jpg)
![Modal](http://ericdavidking.com/wiw/img/wiw-ss2.jpg)
