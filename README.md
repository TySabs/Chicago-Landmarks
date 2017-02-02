# Wonders of the World Map
### By Ty Sabs

## Getting Started
Tour the world's greatest wonders from the comforts of your home.

### View Offline
#### Offline installation
First use the command prompt to install Wonders of the World Map App by typing ``git clone https://github.com/TySabs/World-Wonders-Map.git`` in the command prompt

#### Running the application offline
There are two options for running application offline.

Via Apache:
* Navigate from the root of ```localhost``` to ```index.html``` in your web browser.

Via Node.js:
1. Within the node.js command prompt, run ```npm install``` in the root of the repository.
2. Once dependencies are installed, run gulp's default task by typing ```gulp``` in the node.js command prompt.
3. ```index.html``` should be served at ```localhost:8080``` with live reload
4. Type ```CTRL+C``` in node.js command prompt to turn off your local webserver.

<hr>

### View Online
View the map online here: [Wonders of the World Map](https://tysabs.github.io/World-Wonders-Map/)
<hr>

## How to Use Map Application
* Map contains a number of landmarks represented by red markers.
* Each of these markers are presented in a list view.
* User can click on each list item or marker to open an info window on that landmark.
* Info window will display a street view of the location plus location's current weather conditions.
* User can use a search box to dynamically filter landmark list and markers.

<hr>

## Using Gulp and NPM
* Developers can download all the npm development dependencies by going to the root in the Node.js command prompt. Once in the root of the project, type ```npm install --save-dev``` to install dependencies.
* Gulp will concatenate and minify JavaScript and CSS files with ```gulp devJs```, ```gulp liveJs```, and ```gulp css``` commands.
* While developing, it is recommended your ```index.html``` references ```app.dev.js```.
* In production, it is recommended your ```index.html``` references ```app.min.js``` and ```liveStyles.min.css```.
* To take advantage of caching, but to keep users on latest version, unique numbers are added to the different iterations concatenated/minified files.
* Developers can run a webserver with live reload by typing ```gulp```. Live reload will watch for changes and automatically reload a page whenever a change occurs.
* All tasks will be run when typing ```gulp``` so your webserver should reflect latest changes.
* A specific task can be called by typing ```gulp [name of task]```, consult ```gulpfile.js``` for task names.

<hr>

## Credits
* Udacity Front-End Web Developer Nanodegree Program
* All weather info provided by [Weather Underground API](https://www.wunderground.com/weather/api/d/docs)
* This app utilizes Bootstrap, jQuery, and KnockoutJS libraries
