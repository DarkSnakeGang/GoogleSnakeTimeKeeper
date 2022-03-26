/*
	storage:
	att-modeStr-count-speed-size : number of attempts of this mode
	25-modeStr-count-speed-size: {time: time of 25 score, date: date of 25 score, att: number of attempts that reached 25 score, sum: total time of all attempts that reached 25 score}
	50, 100 and ALL idem.
	H-modeStr-count-speed-size: {high: highscore of this mode, time: time of the highscore run, date: date of the highscore run, sum: total score of all attempts}


*/

window.snake.timeKeeper = {};
window.snake.timeKeeper.debug = false;
//called on every apple
window.snake.timeKeeper.gotApple = function(time, score){
	if(window.snake.timeKeeper.debug){
		console.log("got Apple %s, %s", time, score);
	}
	window.snake.timeKeeper.lastAppleDate = new Date();
	window.snake.timeKeeper.lastAppleTime = time;
	//save time
	if(score == 25 || score == 50 || score == 100){
		window.snake.timeKeeper.savePB(time, score, window.snake.timeKeeper.mode, window.snake.timeKeeper.count, window.snake.timeKeeper.speed, window.snake.timeKeeper.size);
	}
}

//called when you get all apples
window.snake.timeKeeper.gotAll = function(time, score){
	if(window.snake.timeKeeper.debug){
		console.log("got All %s, %s", time, score);
	}
	window.snake.timeKeeper.savePB(time, "ALL", window.snake.timeKeeper.mode, window.snake.timeKeeper.count, window.snake.timeKeeper.speed, window.snake.timeKeeper.size);
}

//called when you're dead, every time.
window.snake.timeKeeper.death = function(time, score){
	if(window.snake.timeKeeper.debug){
		console.log("death %s, %s", time, score);
	}
	if(window.snake.timeKeeper.playing){
		window.snake.timeKeeper.playing = false;
		window.snake.timeKeeper.saveScore(time, score, window.snake.timeKeeper.mode, window.snake.timeKeeper.count, window.snake.timeKeeper.speed, window.snake.timeKeeper.size);
	}
}

//called when you start gamed d
window.snake.timeKeeper.start = function(){
	if(window.snake.timeKeeper.debug){
		console.log("start");
	}
	window.snake.timeKeeper.playing = true;
	//save current settings
	window.snake.timeKeeper.mode = window.snake.timeKeeper.getCurrentMode();
	window.snake.timeKeeper.count = window.snake.timeKeeper.getCurrentSetting("count");
	window.snake.timeKeeper.speed = window.snake.timeKeeper.getCurrentSetting("speed");
	window.snake.timeKeeper.size = window.snake.timeKeeper.getCurrentSetting("size");
	window.snake.timeKeeper.addAttempt(window.snake.timeKeeper.mode, window.snake.timeKeeper.count, window.snake.timeKeeper.speed, window.snake.timeKeeper.size);
}

window.snake.timeKeeper.getCurrentMode = function(){
	element = "";
	for(i of document.querySelectorAll('img')){
    	if(i.src.includes('random.png')){
        	element = i;
    	}
	}
	counter = -1;
	modeStr = "";
	for(child of element.parentElement.parentElement.parentElement.children){
		counter++;
		if(counter == 0){continue;};
		if(child.firstChild.classList.length > 1 && child.firstChild.children.length > 0){
			modeStr+="1";
		}
		else{
			modeStr+="0";
		}
	}

	let mode = window.snake.timeKeeper.getCurrentSetting("trophy");
	if(mode != document.getElementById("trophy").children.length-1){	//not on blender mode
		modeStr = "";
		for(t = 1; t <= 15; t++){
			if(t == mode){
				modeStr += "1";
			}
			else{
				modeStr += "0";
			}
		}
	}
	return modeStr
}

//get the current setting, name = 'count', 'speed', 'size' or 'trophy'
window.snake.timeKeeper.getCurrentSetting = function(name){
	let getSelectedIndex = function(name){
		let elementList = document.getElementById(name);
		let number = 0;
		let classNames = [];
		let notUnique = "";
		for(element of elementList.children){
			if(classNames.indexOf(element.className) == -1){
				classNames.push(element.className);		
			}
			else{
				notUnique = element.className;
				break;
			}
		}
		for(element of elementList.children){
			if(element.className != notUnique){
				return number;
			}
			number++;
		}
		return 0;
	}
	return getSelectedIndex(name);
}

//save highscore
window.snake.timeKeeper.saveScore = function(time, score, mode, count, speed, size){
	if(typeof(window.snake.timeKeeper.lastAppleDate) == "undefined"){
		window.snake.timeKeeper.lastAppleDate = new Date();
	}
	if(typeof(window.snake.timeKeeper.lastAppleTime) == "undefined"){
		window.snake.timeKeeper.lastAppleTime = time;
	}

	time = Math.floor(time);
	let storage = localStorage.getItem("snake_timeKeeper");
	storage = JSON.parse(storage);
	let name = "H"+"-"+mode+"-"+count+"-"+speed+"-"+size;
	//if undefined, save new high
	if(typeof(storage[name]) == "undefined"){
		storage[name] = {"high":score,"time":window.snake.timeKeeper.lastAppleTime,"date":window.snake.timeKeeper.lastAppleDate,"sum":score};
	}
	else{
		//increase sum
		storage[name].sum += score;
		if(score > storage[name].high || (score == storage[name].high && time < storage[name].time)){
			//save new pb
			storage[name].high = score;
			storage[name].time = window.snake.timeKeeper.lastAppleTime;
			storage[name].date = window.snake.timeKeeper.lastAppleDate;
		}
	}
	localStorage.setItem("snake_timeKeeper",JSON.stringify(storage));
}

//save 25, 50, 100 or 'ALL' score
window.snake.timeKeeper.savePB = function(time,score,mode,count,speed,size){
	time = Math.floor(time);
	let storage = localStorage.getItem("snake_timeKeeper");
	storage = JSON.parse(storage);
	let name = score.toString()+"-"+mode+"-"+count+"-"+speed+"-"+size;

	//if undefined, save new pb
	if(typeof(storage[name]) == "undefined"){
		storage[name] = {"time":time,"date":new Date(),"att":1,"sum":time};
	}
	else{
		//increase attempt
		if(typeof(storage[name].att) == "undefined"){storage[name].att = 0};
		storage[name].att+=1;
		//increase sum
		if(typeof(storage[name].sum) == "undefined"){storage[name].sum = 0};
		storage[name].sum+=time;
		if(time < storage[name].time){		//only pb when lower time then stored
			storage[name] = {"time":time,"date":new Date(),"att":storage[name].att,"sum":storage[name].sum};					
		}
	}

	localStorage.setItem("snake_timeKeeper",JSON.stringify(storage));
}

//function to add attempt to localStorage
window.snake.timeKeeper.addAttempt = function(mode, count, speed, size){
	let storage = localStorage.getItem("snake_timeKeeper");
	storage = JSON.parse(storage);
	let name = "att"+"-"+mode+"-"+count+"-"+speed+"-"+size;
	if(typeof(storage[name]) == "undefined"){
		storage[name] = 1;
	}
	else{
		storage[name]+=1;
	}
	localStorage.setItem("snake_timeKeeper",JSON.stringify(storage));
}

window.snake.timeKeeper.setAttempts = function(attempts){
	if(isNaN(attempts)){
		console.log(attempts.toString() + " is not a number!");
		return;
	}
	let storage = localStorage.getItem("snake_timeKeeper");
	storage = JSON.parse(storage);
	mode = window.snake.timeKeeper.getCurrentMode()
	count = window.snake.timeKeeper.getCurrentSetting("count");
	speed = window.snake.timeKeeper.getCurrentSetting("speed");
	size = window.snake.timeKeeper.getCurrentSetting("size");
	let name = "att"+"-"+mode+"-"+count+"-"+speed+"-"+size;
	storage[name] = {};
	storage[name] = attempts;
	localStorage.setItem("snake_timeKeeper",JSON.stringify(storage));
}

window.snake.timeKeeper.setPB = function(time, score, attempts, average){
	if(isNaN(time)){
		console.log(time.toString() + " is not a number!");
		return;
	}
	if(score != 25 && score != 50 && score != 100 && score != "ALL"){
		console.log(score + " has to be 25, 50, 100 or \"ALL\"!");
		return;
	}
	if(isNaN(attempts)){
		console.log(attempts.toString() + " is not a number!");
		return;
	}
	if(isNaN(average)){
		console.log(average.toString() + " is not a number!");
		return;
	}
	let storage = localStorage.getItem("snake_timeKeeper");
	storage = JSON.parse(storage);
	mode = window.snake.timeKeeper.getCurrentMode()
	count = window.snake.timeKeeper.getCurrentSetting("count");
	speed = window.snake.timeKeeper.getCurrentSetting("speed");
	size = window.snake.timeKeeper.getCurrentSetting("size");
	let name = score.toString()+"-"+mode+"-"+count+"-"+speed+"-"+size;
	storage[name] = {};
	storage[name].time = time;
	storage[name].date = new Date();
	storage[name].att = attempts;
	storage[name].sum = Math.round(average * attempts);
	localStorage.setItem("snake_timeKeeper",JSON.stringify(storage));
}

window.snake.timeKeeper.setScore = function(highscore, time, average){
	if(isNaN(highscore)){
		console.log(highscore.toString() + " is not a number!");
		return;
	}
	if(isNaN(time)){
		console.log(time.toString() + " is not a number!");
		return;
	}
	if(isNaN(average)){
		console.log(average.toString() + " is not a number!");
		return;
	}
	let storage = localStorage.getItem("snake_timeKeeper");
	storage = JSON.parse(storage);
	mode = window.snake.timeKeeper.getCurrentMode()
	count = window.snake.timeKeeper.getCurrentSetting("count");
	speed = window.snake.timeKeeper.getCurrentSetting("speed");
	size = window.snake.timeKeeper.getCurrentSetting("size");
	let name = "H"+"-"+mode+"-"+count+"-"+speed+"-"+size;
	storage[name] = {};
	storage[name].high = highscore;
	storage[name].time = time;
	storage[name].date = new Date();
	storage[name].sum = average * storage["att"+"-"+mode+"-"+count+"-"+speed+"-"+size];
	localStorage.setItem("snake_timeKeeper",JSON.stringify(storage));
}

//generate storage if it doesn't exist, or import from old file format.
window.snake.timeKeeper.makeStorage = function(){
	let storage = localStorage.getItem("snake_timeKeeper");
	if(storage == null){
		storage = {};
		storage["version"] = 2;

		//try to read version 1 to new storage type
		old_pbs = localStorage.getItem("snake_pbs");
		if(old_pbs != null){
			old_pbs = JSON.parse(old_pbs);
			console.log("Converting local storage to new storage type...");
			for(mode = 0; mode < 11; mode++){
				modeStr = "000000000000000".split("");
				if(mode != 0){
					modeStr[mode-1] = '1';
				}
				modeStr = modeStr.join('');

				for(count = 0; count < 3; count++){
					for(speed = 0; speed < 3; speed++){
						for(size = 0; size < 3; size++){
							for(let score of ["25","50","100","ALL","att"]){
								let name = score+"-"+mode+"-"+count+"-"+speed+"-"+size;
								if(typeof(old_pbs[name]) != "undefined"){
									console.log(name, old_pbs[name]);
									newName = score+"-"+modeStr+"-"+count+"-"+speed+"-"+size;
									storage[newName] = old_pbs[name];
								}

							}
						}
					}
				}
			}
		}
	}
	else{
		storage = JSON.parse(storage);
	}
	if(storage["version"] != 2){
		alert("Something went wrong with you localStorage!");
	}
	localStorage.setItem("snake_timeKeeper",JSON.stringify(storage));
}

//generate and show the dialog
window.snake.timeKeeper.showDialog = function(){
	//make dialog
	dialog = document.createElement("dialog");
	dialog.setAttribute("open","");
	dialog.setAttribute("id","timeKeeperDialog");

	let count = window.snake.timeKeeper.getCurrentSetting("count");
	let speed = window.snake.timeKeeper.getCurrentSetting("speed");
	let size = window.snake.timeKeeper.getCurrentSetting("size");
	let modeStr = window.snake.timeKeeper.getCurrentMode("size");
	//change modeStr to gamemode
	counter = 0
	var gamemode = "";
	for(t of modeStr){
		if(t == 1){
			switch(counter){
				case 0: gamemode += "Wall, "; break;
				case 1: gamemode += "Portal, "; break;
				case 2: gamemode += "Cheese, "; break;
				case 3: gamemode += "Infinity, "; break;
				case 4: gamemode += "Twin, "; break;
				case 5: gamemode += "Winged, "; break;
				case 6: gamemode += "YinYang, "; break;
				case 7: gamemode += "Key, "; break;
				case 8: gamemode += "Sokoban, "; break;
				case 9: gamemode += "Poison, "; break;
				case 10: gamemode += "Dimension, "; break;
				case 11: gamemode += "Peaceful, "; break;
				default: gamemode += "Unknown, "; break;
			}
		}
		counter++;
	}
	if(gamemode == ""){
		gamemode = "Classic, ";
	}
	gamemode = gamemode.substring(0, gamemode.lastIndexOf(","));

	//add level information
	bold = document.createElement('strong');
    textnode = document.createTextNode("TimeKeeper"); 
    bold.appendChild(textnode);
    dialog.appendChild(bold);
	dialog.appendChild(document.createElement("br"));
	dialog.appendChild(document.createTextNode("Mode: "+gamemode));
	dialog.appendChild(document.createElement("br"));
	switch(count){
		case 0: dialog.appendChild(document.createTextNode("1 Apple, ")); break;
		case 1: dialog.appendChild(document.createTextNode("3 Apples,")); break;
		default: dialog.appendChild(document.createTextNode("5 Apples, ")); break;
	}
	switch(speed){
		case 0: dialog.appendChild(document.createTextNode("Normal speed, ")); break;
		case 1: dialog.appendChild(document.createTextNode("Fast speed,")); break;
		default: dialog.appendChild(document.createTextNode("Slow speed, ")); break;
	}
	switch(size){
		case 0: dialog.appendChild(document.createTextNode("Normal size")); break;
		case 1: dialog.appendChild(document.createTextNode("Small size")); break;
		default: dialog.appendChild(document.createTextNode("Large size")); break;
	}

	//add stats
	dialog.appendChild(document.createElement("br"));
	dialog.appendChild(document.createElement("br"));
	storage = JSON.parse(localStorage["snake_timeKeeper"]);
	let totalAttempts = 0;
	for(let score of ["att", "25","50","100","ALL", "H"]){
		let name = score+"-"+modeStr+"-"+count+"-"+speed+"-"+size;
		if(typeof(storage[name]) != "undefined"){

			bold = document.createElement('strong');
			switch(score){
				case "25": bold.appendChild(document.createTextNode("25 Apples:")); break;
				case "50": bold.appendChild(document.createTextNode("50 Apples:")); break;
				case "100": bold.appendChild(document.createTextNode("100 Apples:")); break;
				case "ALL": bold.appendChild(document.createTextNode("All Apples:")); break;
				case "att": bold.appendChild(document.createTextNode("Total Attempts: ")); break;
				case "H": bold.appendChild(document.createTextNode("Highscore: ")); break;
				default: break;
			}
			dialog.appendChild(bold);

			if(score == "att"){
				totalAttempts = storage[name];
				dialog.appendChild(document.createTextNode(totalAttempts));
				dialog.appendChild(document.createElement("br"));
			}
			else if(score == "H"){
				dialog.appendChild(document.createTextNode(storage[name].high));
			}

			dialog.appendChild(document.createElement("br"));

			if(score == "att")
				continue;

			minutes = Math.floor(storage[name].time/60000);
			seconds = Math.floor((storage[name].time-minutes*60000)/1000);
			mseconds = storage[name].time-minutes*60000-seconds*1000;
			if(minutes.toString().length < 2){minutes = "0"+minutes.toString()}
			if(seconds.toString().length < 2){seconds = "0"+seconds.toString()}
			while(mseconds.toString().length < 3){mseconds = "0"+mseconds.toString()}
			if(score != "H"){
				dialog.appendChild(document.createTextNode("Best Time: "+minutes+":"+seconds+":"+mseconds));
				dialog.appendChild(document.createElement("br"));
				dialog.appendChild(document.createTextNode("Achieved on: "+new Date(storage[name].date).toString()));
				dialog.appendChild(document.createElement("br"));
			}
			else{
				dialog.appendChild(document.createTextNode("Duration: "+minutes+":"+seconds+":"+mseconds));
				dialog.appendChild(document.createElement("br"));
				dialog.appendChild(document.createTextNode("Achieved on: "+new Date(storage[name].date).toString()));
				dialog.appendChild(document.createElement("br"));
				dialog.appendChild(document.createTextNode("Average score: "+(Math.round(100 * (storage[name].sum/totalAttempts)) /100).toString()));
				dialog.appendChild(document.createElement("br"));
			}
			if(storage[name].att != undefined && storage[name].sum != undefined){
				let time = Math.floor(storage[name].sum/storage[name].att);
				minutes = Math.floor(time/60000);
				seconds = Math.floor((time-minutes*60000)/1000);
				mseconds = time-minutes*60000-seconds*1000;
				if(minutes.toString().length < 2){minutes = "0"+minutes.toString()}
				if(seconds.toString().length < 2){seconds = "0"+seconds.toString()}
				while(mseconds.toString().length < 3){mseconds = "0"+mseconds.toString()}
				dialog.appendChild(document.createTextNode("Attempts to this point: "+storage[name].att));
				dialog.appendChild(document.createElement("br"));
				dialog.appendChild(document.createTextNode("Average: "+minutes+":"+seconds+":"+mseconds));
				dialog.appendChild(document.createElement("br"));
			}
			dialog.appendChild(document.createElement("br"));
		}
	}

	//buttonClose
	dialog.appendChild(document.createElement("br"));
	buttonClose = document.createElement("button");
	buttonClose.appendChild(document.createTextNode("Close"));
	buttonClose.addEventListener("click", function(){
		//remove dialog when click on ok
		child = document.getElementById("timeKeeperDialog");
		child.parentElement.removeChild(child);
	});
	dialog.appendChild(buttonClose);

	//buttonExport
	buttonExport = document.createElement("button");
	buttonExport.appendChild(document.createTextNode("Export"));
	buttonExport.addEventListener("click", function(){
		download("timeKeeper - "+new Date().toString()+".txt", "To import: open snake -> open console -> paste the following:\nlocalStorage[\"snake_timeKeeper\"]='"+localStorage["snake_timeKeeper"]+"'");
	});
	dialog.appendChild(buttonExport);

	//add dialog
	div = document.querySelector("body");
	dialog.setAttribute("style","z-index:9999;top:-50px;right:-50px;bottom:-50px;left:-50px;");
	div.insertBefore(dialog, div.firstChild)};

function processSnakeCode(code){
	//change stepfunction to run gotApple(), gotAll() and death()
	let func = code.match(/[a-zA-Z0-9_$.]{1,40}=function\(\)[^\\]{1,1000}RIGHT":0[^\\]*?=function/)[0];
	func = func.substring(0,func.lastIndexOf(";"));
	let modeFunc = func.match(/!1}\);[^%]{0,10}/)[0];
	modeFunc = modeFunc.substring(modeFunc.indexOf("(")+1,modeFunc.lastIndexOf("("));
	scoreFunc = func.match(/25\!\=\=this.[a-zA-Z0-9$]{1,4}/)[0];
	scoreFunc = scoreFunc.substring(scoreFunc.indexOf("this."),scoreFunc.size);
	timeFunc = func.match(/this.[a-zA-Z0-9$]{1,6}\*this.[a-zA-Z0-9$]{1,6}/)[0];
	ownFuncIndex = func.indexOf(func.match(/!1}\);\([^%]{0,10}/)[0])+5;
	ownFunc = "window.snake.timeKeeper.gotApple(Math.floor("+timeFunc+"),"+scoreFunc+");"
	func = func.slice(0, ownFuncIndex) + ownFunc + func.slice(ownFuncIndex);

	//change all apples to run gotAll()
	func = func.slice(0,func.indexOf("WIN.play()")+11)+"window.snake.timeKeeper.gotAll(Math.floor("+timeFunc+"),"+scoreFunc+"),"+func.slice(func.indexOf("WIN.play()")+11);

	death = func.match(/if\(this.[a-zA-Z0-9$]{1,4}\|\|this.[a-zA-Z0-9$]{1,4}\)/)[0];
	death = death.slice(death.indexOf("(")+1,death.indexOf("|"));
	func = func.slice(0,func.indexOf("{")+1) + "if("+death+"){window.snake.timeKeeper.death(Math.floor("+timeFunc+"),"+scoreFunc+");}" + func.slice(func.indexOf("{")+1)
	eval(func)

	//change start function to run gameStart()
	func = code.match(/[a-zA-Z0-9_$]{1,6}=function\(a,b\){if\(!\(a.[a-zA-Z0-9$]{1,4}[^\\]*?=function/)[0];
	func = func.substring(0, func.lastIndexOf(";"));
	step = timeFunc.substring(0,timeFunc.indexOf("*"));
	step = "a"+step.slice(step.indexOf("."));
	
	func = func.slice(0,func.indexOf("{")+1)+"if("+step+"==0){window.snake.timeKeeper.start();}"+func.slice(func.indexOf("{")+1);
	eval(func)

	//add eventhandler to click on time
	//let id = code.match(/function\(a\){if\(\!a.[a-zA-Z0-9]{1,4}&&[^"]*?"[^"]*?"/)[0];
	//id = id.substring(id.indexOf("\"")+1, id.lastIndexOf("\""));
	let id = code.match(/"[^"]{1,9}"[^"]{1,200}"00:00:000/)[0];
	id = id.substring(1, id.indexOf("\"",2));
	document.querySelector("div[jsname^=\""+id+"\"]").addEventListener("click",(e)=>{
		window.snake.timeKeeper.showDialog();
	});
}

//Function to find the snake code, and apply changes.
window.snake.timeKeeper.setup = function(){
	//apply changes to snake code
	const scripts = document.getElementsByTagName("script");
	let url = "";
	var code = ""
	/*find the script*/
	for(let script of scripts){
		if(script.src != "" && script.src.indexOf('apis.google.com')==-1){
			// xhr to get source code
			try{
				const req = new XMLHttpRequest();
				req.open("GET", script.src);
				req.onload = function() {
					/*check if this is the snake script*/
					if(this.responseText.indexOf('trophy') != -1){
						code = this.responseText
						processSnakeCode(code);
					}
				};
				req.send();
			}
			catch(a){}
		}
	}
	window.snake.timeKeeper.makeStorage();
	return;
}

//Function to create and download text files, source: 
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}


window.snake.timeKeeper.setup();
window.snake.speedrun();