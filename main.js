import './basic.less'
import { screen, utils, controls } from 'wombat'
import template from './basic.html'
//specify the variables used in this document 
var CONFIG,
    ONCOMPLETE,
    STIMULI,
    IMAGES,
    _mainScreen,
    _display,
    _textElement,
    _imageElement,
    _buttonElement

export default function(config, cb){
	CONFIG = config
	ONCOMPLETE = cb
//function caller in asynchronous format
	async.series([
//load in this order
		prepareConfig,
		prepareUI
	], function(){
		next()
	})
}

var priorBackground;
function fadeToBlack(cb){
//set the colour to the css class "background-color"
	priorBackground = _mainScreen.css('background-color')
//animate the fade with a timer
	_mainScreen.animate({
		//colour to be set to
			backgroundColor: '#000'
		//how long it will take to fade to that colour
		}, 2000, function(){
			_display.domElement.fadeIn('fast', cb)
		})
}

function fadeFromBlack(cb){

	_mainScreen.animate({
		backgroundColor: priorBackground
	}, 2000, screen.exit('fade', cb))
}

function next(){
//if nothing to display, start fade to black
	if(_.isEmpty(STIMULI)) return fadeFromBlack(ONCOMPLETE)
//shift to next stimuli(image)
	var nextStimuli = STIMULI.shift()
//how the image is desplayed (json) (the next image is the name that ends in .img)
	var nextImage = IMAGES[nextStimuli.name].img
	//the next text is that which ends in .text

	var nextText = IMAGES[nextStimuli.name].text
console.log(nextText)
	//next button in the chain, 
	var nextButton = IMAGES[nextStimuli.name].button
//displays the images
	_imageElement.set(nextImage)
	_imageElement.show()

	const style =  nextStimuli.textStyle || {}
console.log(nextStimuli)
//displays the text
	_textElement.domElement
		.html(nextText)
		.css(style)
console.log(style)
	_textElement.show()
//displays the button

	_buttonElement.set(nextButton)
	_buttonElement.show()

//hides elements between desplays
	utils.delay(nextStimuli.duration, function(){
		_imageElement.hide()
		_textElement.hide()
		_buttonElement.hide()
		//Time between the next image
		utils.delay(1000, next)
	})
	
	}

function prepareUI(cb){
	_mainScreen = $(template).clone()
//sets right stim as the text element. This also recalls to html and css
	_textElement = controls.display(_mainScreen.find('.stimRight'))
//setting the leftstim as the image element
	_imageElement = controls.display(_mainScreen.find('.stimLeft'))
//config button
	_buttonElement = controls.display(_mainScreen.find('.dynButton'))
//display = box
	_display = controls.display(_mainScreen.find('.box'))
	_display.hide()
	screen.enter(_mainScreen,'fade', cb)
}

//main perp config, maps stimuli (images) 
function prepareConfig(cb){
	var stimuli = _.map(CONFIG.stimuli, function(s){
//if not specified default duration = 3 seconds 
		if(!s.duration) {s.duration = CONFIG.duration || 3000}
		return s
	})
	//if the config for randomise is set to true then shuffle the images
	if(CONFIG.randomise) stimuli = utils.shuffle(stimuli)
		console.log(stimuli)

	STIMULI = stimuli // outer scope reference
	utils.preloadImages(CONFIG.stimuli, function(images){
		console.log(images)
		IMAGES = images
		cb()
	})
}