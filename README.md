# When I Work SpreadSheets

I was frustrated with the presentation of shifts on WhenIWork.com 's website 
so I created this server/front-end application using Node and Angular. I created 
it with our team in mind so it works good when it's a fairly small team (~10 people).

Try it out at http://mean.ericdavidking.com

In order to get this working for your account you must first sign up for a developer
key at http://www.wheniwork.com.  Copy your developer key into the file:

public/js/var/wiw.json 

as a value for the element "WKey" (the only pair in the object). 

As long as you have npm and have installed all the dependencies (package.json contains all front and back end deps)
then it should work.

![Schedule](http://ericdavidking.com/wiw/img/wiw-ss.jpg)
![Modal](http://ericdavidking.com/wiw/img/wiw-ss2.jpg)
