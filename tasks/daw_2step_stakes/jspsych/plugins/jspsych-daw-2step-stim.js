/**
* jspsych-daw-2step-stim
* Wouter Kool
*
* plugin for displaying the Daw 2-step task with a 'stakes' manipulation
*
**/

(function($) {
	jsPsych["daw-2step-stim"] = (function() {

		var plugin = {};
		
		var score = 0;
		
		var displayColor = '#0738db';
		var borderColor = '#197bff';
		var textColor = '#b8fff6';
		
		plugin.create = function(params) {

			params = jsPsych.pluginAPI.enforceArray(params, ['stimuli', 'choices']);
			
			var trials = new Array(params.nrtrials);
			
			for (var i = 0; i < trials.length; i++) {
				
				trials[i] = {};
				trials[i].practice = params.practice || 0;
				trials[i].ps = params.ps;
				trials[i].subid = params.subid;
				trials[i].stakes = params.stakes || 1;
				trials[i].pstakes = params.pstakes || 1;
				//trials[i].fixed_time = params.fixed_time || false;
				
				trials[i].index = i;
				
				// timing parameters
				trials[i].feedback_time = params.feedback_time || 500;
				trials[i].ITI = params.ITI || 500;
				trials[i].timeout_time = params.timeout_time || 1500;
				trials[i].timing_response = params.timing_response || 1500; // if -1, then wait for response forever
				trials[i].score_time = params.score_time || 1500;
				trials[i].totalscore_time = params.totalscore_time || 1000;
				trials[i].multiplier_time = params.multiplier_time || 1500;
				trials[i].SOA = params.SOA || 500;
				trials[i].points_time = params.points_time || 200;
				
			}
			return trials;
			
		};
		
		plugin.trial = function(display_element, trial) {
			
			// if any trial variables are functions
			// this evaluates the function and replaces
			// it with the output of the function
			
			trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
			
			progress = jsPsych.progress();
			if (progress.current_trial_local == 0) {
				score = 0;
			}
			
			var state1stims = [1,2];
			var stims_s1 = shuffle(state1stims);
			var state2stims = [1,2];
			var stims_s2 = shuffle(state2stims);		
			
			var stims = stims_s1;
			
			var part = -1;
			var choice1 = -1;
			var state2 = -1;
						
			var show_points = 0;
			
			var stake = -1;
			
			var pause = 0;
			
			var state_names = ["earth","purple","red"];
			var state_colors = [
				[5, 157, 190],
				[115, 34, 130],
				[211, 0, 0]
			];
			
			if (typeof trial.stakes.length != 'undefined') {
				if (trial.index < 10) {
					stake = trial.stakes[0];
				} else {
					stake_p = Math.random();
					for (var i = 0; i <= trial.stakes.length; i++){
						if (stake_p <= trial.pstakes[i]) {
							var stake = trial.stakes[i];
							break
						}
					}
				}
			} else {
				var stake = trial.stakes;
			}
			
			// store responses
			var setTimeoutHandlers = [];
			
			var keyboardListener = new Object;	
			
			var response = new Array(2);
			for (var i = 0; i < 2; i++) {	
				response[i] = {rt: -1, key: -1};
			}

			var state = 0;
			
			var both_choices = [["F","J"],["F","J"]];
			var choices = new Array;
						
			// function to end trial when it is time
			var end_trial = function(){
				
				kill_listeners();
				kill_timers();
								
				// gather the data to store for the trial
				
				var trial_data = {
					"subid": trial.subid,
					"stim_s1_left": stims_s1[0],
					"stim_s1_right": stims_s1[1],
					"rt_1": response[0].rt,
					"choice1": choice1,
					"response1": response[0].key,
					"stim_s2_left": stims_s2[0],
					"stim_s2_right": stims_s2[1],
					"rt_2": response[1].rt,
					"choice2": choice2,
					"response2": response[1].key,
					"win": win,
					"state2": state2,
					"stake": stake,
					"score": score,
					"practice": trial.practice,
					"ps1a1": trial.ps[0][0],
					"ps1a2": trial.ps[0][1],
					"ps2a1": trial.ps[1][0],
					"ps2a2": trial.ps[1][1],
				};
				
				jsPsych.data.write(trial_data);
				
				var handle_totalscore = setTimeout(function() {
					// clear the display
					display_element.html('');
					$('.jspsych-display-element').css('background-image', '');
				
					// move on to the next trial
					var handle_ITI = setTimeout(function() {
						jsPsych.finishTrial();
					}, trial.ITI);
					setTimeoutHandlers.push(handle_ITI);
				}, trial.totalscore_time);
				setTimeoutHandlers.push(handle_totalscore);
				
			};
			
			// function to handle responses by the subject
			var after_response = function(info){
				
				kill_listeners();
				kill_timers();
				
				if (pause == 0) {
							
					// only record the first response
					if (response[part].key == -1){
						response[part] = info;
					}
								
					display_stimuli(2); //feedback
				
					if (trial.timing_response>0) {
						var extra_time = trial.timing_response-response[part].rt;
					} else {
						var extra_time = 0;
					}
					
					//var extra_time = 0;
				
					if (state == 0) {
						if (String.fromCharCode(response[part].key)==choices[0]) { // left response
							choice1 = stims_s1[0];
						} else {
							choice1 = stims_s1[1];						
						}
						
						state2 = choice1+((Math.random()>0.7)*(choice1==1))-((Math.random()>0.7)*(choice1==2));
						
						stims = stims_s2;
						state = state2;
					
						var handle_feedback = setTimeout(function() {
							display_element.html('');
							next_part();
						}, trial.feedback_time+extra_time);
						setTimeoutHandlers.push(handle_feedback);
					
					} else {
						if (String.fromCharCode(response[part].key)==choices[0]) { // left response
							choice2 = stims_s2[0];
						} else {
							choice2 = stims_s2[1];						
						}
						
						win = Math.random()<trial.ps[state-1][choice2-1];
						score = score + stake*win;
						
						display_stimuli(2);
						var handle_feedback = setTimeout(function() {
							display_stimuli(3);
							var handle_score = setTimeout(function() {
								if (win==1) {
									show_points = 1;
								}
								display_stimuli(3);
								var handle_points = setTimeout(function() {
									end_trial();
								}, trial.points_time);
								setTimeoutHandlers.push(handle_points);
							}, trial.score_time);
							setTimeoutHandlers.push(handle_score);
						}, trial.feedback_time+extra_time);
						setTimeoutHandlers.push(handle_feedback);
					}			
					// show feedback	
				}
				else {
					
					pause = 0;
					
					display_element.html('');
					
					var handle_pause = setTimeout(function() {
						next_part();
					}, trial.multiplier_time);
					setTimeoutHandlers.push(handle_pause);
					
				}
								
			};
			
			var display_stimuli = function(stage){
				
				kill_timers();
				kill_listeners();
				
				state_name = state_names[state];
				state_color = state_colors[state];
				
				if (stage==-1) { // timeout	at first level
					$('#jspsych-daw-2step-bottom-stim-left').html('<br><br>X');
					$('#jspsych-daw-2step-bottom-stim-right').html('<br><br>X');
					$('#jspsych-daw-2step-bottom-stim-left').css('background-image', 'url(img/'+state_name+'_stim_'+stims[0]+'_deact.png)');
					$('#jspsych-daw-2step-bottom-stim-right').css('background-image', 'url(img/'+state_name+'_stim_'+stims[1]+'_deact.png)');
					if (trial.practice == 0) {
						$('#jspsych-daw-2step-top-stim-right').html($('<div id="sub-div-2" style="padding-right:20px; text-align:right;">score: '+score+'</div>'))
					}
				}
				
				if ((stage == 0.5) || (stage == 0.75)) { // scoreboard
					display_element.html('');
					
					$('.jspsych-display-element').css('background-image', 'url("img/'+state_name+'_planet.png")');
					
					if (stage == 0.5) {
						
						display_element.append($('<div>', {
							id: 'jspsych-daw-2step-top-multiplier',
						}));
						$('#jspsych-daw-2step-top-multiplier').append($('<span></span>'))
						$('#jspsych-daw-2step-top-multiplier').append($('<div class="b">'+stake+'x</div>'))
					}
				}
				
				if (stage==1) { // choice stage
					display_element.html('');

					$('.jspsych-display-element').css('background-image', 'url("img/'+state_name+'_planet.png")');				
					display_element.append($('<div>', {
						id: 'jspsych-daw-2step-top-stim-left',
					}));
					if (trial.practice == 0) {
						$('#jspsych-daw-2step-top-stim-left').append($('<div id="sub-div" style="text-align:left;">'))
						$('#sub-div').append($('<div id="jspsych-daw-2step-mini-multiplier">'))
						$('#jspsych-daw-2step-mini-multiplier').append($('<span></span>'))
						$('#jspsych-daw-2step-mini-multiplier').append($('<div class="b2">'+stake+'x</div>'))
					}
										
					display_element.append($('<div>', {
						id: 'jspsych-daw-2step-top-stim-middle',
					}));
					display_element.append($('<div>', {
						id: 'jspsych-daw-2step-top-stim-right',
					}));
					if (trial.practice == 0) {
						$('#jspsych-daw-2step-top-stim-right').append($('<div id="sub-div-2" style="text-align:right;">score: '+score+'</div>'))
					}
					
					display_element.append($('<div>', {
						style: 'clear:both',
					}));
					
					display_element.append($('<div>', {
						id: 'jspsych-daw-2step-middle-stim-left',
					}));
					display_element.append($('<div>', {
						id: 'jspsych-daw-2step-middle-stim-middle',
					}));
					display_element.append($('<div>', {
						id: 'jspsych-daw-2step-middle-stim-right',
					}));
					
					display_element.append($('<div>', {
						style: 'clear:both',
					}));
					
					display_element.append($('<div>', {
						id: 'jspsych-daw-2step-bottom-stim-left',
					}));
					display_element.append($('<div>', {
						id: 'jspsych-daw-2step-bottom-stim-middle',
					}));
					display_element.append($('<div>', {
						id: 'jspsych-daw-2step-bottom-stim-right',
					}));
						
					$('#jspsych-daw-2step-bottom-stim-left').css('background-image', 'url(img/'+state_name+'_stim_'+stims[0]+'.png)');
					$('#jspsych-daw-2step-bottom-stim-right').css('background-image', 'url(img/'+state_name+'_stim_'+stims[1]+'.png)');
					
					if (state>0) {
						$('#jspsych-daw-2step-middle-stim-middle').css('background-image', 'url(img/earth_stim_'+choice1+'_deact.png)');
					}
				}
				
				if (stage==2) { // feedback
					if (String.fromCharCode(response[part].key)==choices[0]) { // left response
						$('#jspsych-daw-2step-bottom-stim-right').css('background-image', 'url(img/'+state_name+'_stim_'+stims[1]+'_deact.png)');
						$('#jspsych-daw-2step-bottom-stim-left').addClass('jspsych-daw-2step-bottom-stim-border');
						$('#jspsych-daw-2step-bottom-stim-left').css('border-color', 'rgba('+state_color[0]+','+state_color[1]+','+state_color[2]+', 1)');
					} else {
						$('#jspsych-daw-2step-bottom-stim-left').css('background-image', 'url(img/'+state_name+'_stim_'+stims[0]+'_deact.png)');
						$('#jspsych-daw-2step-bottom-stim-right').css('border-color', 'rgba('+state_color[0]+','+state_color[1]+','+state_color[2]+', 1)');
						$('#jspsych-daw-2step-bottom-stim-right').addClass('jspsych-daw-2step-bottom-stim-border');
					}					
				}
				
				if (stage==3) { // reward
					
					if (String.fromCharCode(response[part].key)==choices[0]) { // left response
						position = 'left';
						pos = 0;
					} else {
						position = 'right';
						pos = 1;
					}
										
					if (win==0) {
						$('#jspsych-daw-2step-middle-stim-'+position).css('background-image', 'url(img/noreward.png)');
						$('#jspsych-daw-2step-bottom-stim-'+position).css('background-image', 'url(img/'+state_name+'_stim_'+stims[pos]+'_sad.png)');
					} else {
						if (show_points == 0) {
							$('#jspsych-daw-2step-middle-stim-'+position).css('background-image', 'url(img/treasure.png)');
							$('#jspsych-daw-2step-bottom-stim-'+position).css('background-image', 'url(img/'+state_name+'_stim_'+stims[pos]+'_happy.png)');
						} else {
							$('#jspsych-daw-2step-middle-stim-'+position).css('background-image', '');
							$('#jspsych-daw-2step-middle-stim-'+position).append($('<div style="position:absolute; bottom:0; width:100%; text-align:center;">+'+stake+'</div>'));
						}
						if (trial.practice == 0) {
							$('#sub-div-2').html('score: '+(score));
						}
					}
					
				}
				
			}
			
			var start_response_listener = function(){
				
				if (pause == 0) {
					if (part == 0) {
						choices = both_choices[0];
					} else {
						choices = both_choices[1];
					}
				} else {
					choices = ["space"];
				}
								
				if(JSON.stringify(choices) != JSON.stringify(["none"])) {
					var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
						callback_function: after_response,
						valid_responses: choices,
						rt_method: 'date',
						persist: false,
						allow_held_key: false,
					});
				}
				
			}
			
			var kill_timers = function(){
				for (var i = 0; i < setTimeoutHandlers.length; i++) {
					clearTimeout(setTimeoutHandlers[i]);
				}
			}
			
			var kill_listeners = function(){
				// kill keyboard listeners
				if(typeof keyboardListener !== 'undefined'){
					jsPsych.pluginAPI.cancelAllKeyboardResponses();
					//jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
				}
			}
			
			var next_part = function(){
				
				part = part + 1;
				
				kill_timers();
				kill_listeners();
				
				if (part == 0) {
					if (trial.practice == 0) {
						display_stimuli(0.5);
						multiplier_time = trial.multiplier_time;
						SOA = trial.SOA;
					} else {
						display_stimuli(0.75);
						multiplier_time = 0;
						SOA = 0;
					}
				} else {
					multiplier_time = 0;
					SOA = 0;
				}
				
				
				var handle_mult = setTimeout(function() {
					display_stimuli(0.75);
					
					var handle_soa = setTimeout(function() {
						display_stimuli(1);
						start_response_listener();
								
						if (trial.timing_response>0) {	
							var handle_response = setTimeout(function() {
								kill_listeners();
								display_stimuli(-1);
								var handle_timeout = setTimeout(function() {
									end_trial();
								}, trial.timeout_time);
								setTimeoutHandlers.push(handle_timeout);
							}, trial.timing_response);
							setTimeoutHandlers.push(handle_response);
						}
					}, SOA);
					setTimeoutHandlers.push(handle_soa)
				}, multiplier_time);
				setTimeoutHandlers.push(handle_mult);
				
			}			
			
			if (trial.index!=100){
				next_part();
			} else {
				pause = 1;
				display_element.html('');
				display_element.append($('<div>', {
					html: 'You completed 100/200 trials. You can take a break now.<br><br>Press space to continue.',
				}));
				start_response_listener();
			}
			
		};
		
		return plugin;
		
	})();
})(jQuery);
