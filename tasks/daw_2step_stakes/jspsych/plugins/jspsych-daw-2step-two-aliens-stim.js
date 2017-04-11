/**
* jspsych-daw-2step-stim
* Wouter Kool
*
* plugin for displaying a instructional screen about choosing between the two terminal states in the Daw 2-step task
*
**/

(function($) {
	jsPsych["daw-2step-two-aliens-stim"] = (function() {

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
				trials[i].choices = params.choices || ["F","J"];
				trials[i].ps = params.ps;
								
				// timing parameters
				trials[i].feedback_time = params.feedback_time || 500;
				trials[i].ITI = params.ITI || 500;
				trials[i].points_time = params.points_time || 1000;
				trials[i].state_name = params.state_name || 'purple';
				trials[i].points_loop_time = params.points_loop_time || 200;
				trials[i].score_time = params.score_time || 1000;
				
			}
			return trials;
			
		};
		
		plugin.trial = function(display_element, trial) {
			
			// if any trial variables are functions
			// this evaluates the function and replaces
			// it with the output of the function
			
			trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
			
			stims = shuffle([1,2]);
						
			state_name = trial.state_name;
			if (state_name == 'purple') {
				var state_color = [115, 34, 130];
			}
			if (state_name == 'red') {
				var state_color = [211, 0, 0];
			}
			
			// store responses
			var setTimeoutHandlers = [];
			
			var keyboardListener = new Object;	
			
			var show_points = 0;
			
			var position = '';
			var pos = -1;
						
			// function to end trial when it is time
			var end_trial = function() {
				
				kill_listeners();
				kill_timers();
				
				//jsPsych.data.write(trial_data);
				
				var handle_points = setTimeout(function() {
					// clear the display
					display_element.html('');
					$('.jspsych-display-element').css('background-image', '');
				
					// move on to the next trial
					var handle_ITI = setTimeout(function() {
						jsPsych.finishTrial();
					}, trial.ITI);
					setTimeoutHandlers.push(handle_ITI);
				}, trial.points_time);
				setTimeoutHandlers.push(handle_points);
				
			};

			// function to handle responses by the subject
			var after_response = function(info) {
				
				kill_listeners();
				kill_timers();
				
				if (String.fromCharCode(info.key)==trial.choices[0]) { // left response
					position = 'left';
					pos = 0;
					other_position = 'right';
					other_pos = 1;
				} else {
					position = 'right';
					pos = 1;
					other_position = 'left';
					other_pos = 0;
				}
								
				win = Math.random()<trial.ps[stims[pos]-1];
					
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
				}, trial.feedback_time);
				setTimeoutHandlers.push(handle_feedback);
			}								
		
			
		var display_stimuli = function(stage){
				
			kill_timers();
			kill_listeners();
			
			//state_name = state_names[state];
			//state_color = state_colors[state];
				
				
			if (stage==1) { // choice stage
				
				display_element.html('');

				$('.jspsych-display-element').css('background-image', 'url("img/'+state_name+'_planet.png")');				

				display_element.append($('<div>', {
					id: 'jspsych-daw-2step-top-stim-left',
				}));									
				display_element.append($('<div>', {
					id: 'jspsych-daw-2step-top-stim-middle',
				}));
				display_element.append($('<div>', {
					id: 'jspsych-daw-2step-top-stim-right',
				}));
				
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
									
			}
				
			if (stage==2) { // feedback
				$('#jspsych-daw-2step-bottom-stim-'+position).addClass('jspsych-daw-2step-bottom-stim-border');
				$('#jspsych-daw-2step-bottom-stim-'+position).css('border-color', 'rgba('+state_color[0]+','+state_color[1]+','+state_color[2]+', 1)');
				$('#jspsych-daw-2step-bottom-stim-'+other_position).css('background-image', 'url(img/'+state_name+'_stim_'+stims[other_pos]+'_deact.png)');
			}
				
			if (stage==3) { // reward
								
				if (win==0) {
					$('#jspsych-daw-2step-middle-stim-'+position).css('background-image', 'url(img/noreward.png)');
					$('#jspsych-daw-2step-bottom-stim-'+position).css('background-image', 'url(img/'+state_name+'_stim_'+stims[pos]+'_sad.png)');
				} else {
					if (show_points == 0) {
						$('#jspsych-daw-2step-middle-stim-'+position).css('background-image', 'url(img/treasure.png)');
						$('#jspsych-daw-2step-bottom-stim-'+position).css('background-image', 'url(img/'+state_name+'_stim_'+stims[pos]+'_happy.png)');
					} else {
						$('#jspsych-daw-2step-middle-stim-'+position).css('background-image', '');
						$('#jspsych-daw-2step-middle-stim-'+position).append($('<div style="position:absolute; bottom:0; width:100%; text-align:center;">+1</div>'));
					}
				}
			}
		}
			
		var start_response_listener = function(){
			if(JSON.stringify(trial.choices) != JSON.stringify(["none"])) {
				var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
					callback_function: after_response,
					valid_responses: trial.choices,
					rt_method: 'date',
					persist: false,
					allow_held_key: false
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
							
			kill_timers();
			kill_listeners();
				
			display_stimuli(1);
							
			start_response_listener();
		}							
		
		next_part();
	};		
	
	return plugin;
	
})();
})(jQuery);
