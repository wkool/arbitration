function groupdata = make_raw_data

load('data.mat');
load('subinfo.mat');

s = 0;

state1_i = 1;
stim_left_i = 2;
stim_right_i = 3;
rt1_i = 4;
choice1_i = 5;
response1_i = 6;
rt2_i = 7;
points_i = 8;
state2_i = 9;
stake_i = 10;
score_i = 11;
practice_i = 12;
rews1_i = 13;
rews2_i = 14;
trial_i = 15;
% time_elapsed_i = 16;

for i = 1:length(subinfo)
    
    s = s + 1;
    
    groupdata.subdata{s}.id = subinfo(i,1);
    
    subdata = cell2mat(data(strcmp(subinfo(i,1),data(:,1)),2:17));
    groupdata.nrtrials(s) = length(subdata);
    
    subdata(subdata(:,practice_i)==1,:)=[]; % no practice
    
    groupdata.subdata{s}.state1 = subdata(:,state1_i);
    groupdata.subdata{s}.stim_left = subdata(:,stim_left_i);
    groupdata.subdata{s}.stim_right = subdata(:,stim_right_i);
    groupdata.subdata{s}.rt1 = subdata(:,rt1_i);
    groupdata.subdata{s}.choice1 = subdata(:,choice1_i);
    groupdata.subdata{s}.response1 = subdata(:,response1_i);
    groupdata.subdata{s}.rt2 = subdata(:,rt2_i);
    groupdata.subdata{s}.points = subdata(:,points_i);
    groupdata.subdata{s}.state2 = subdata(:,state2_i);
    groupdata.subdata{s}.stake = subdata(:,stake_i);
    groupdata.subdata{s}.win = subdata(:,points_i)>0;
    groupdata.subdata{s}.score = subdata(:,score_i);
    groupdata.subdata{s}.practice = subdata(:,practice_i);
    groupdata.subdata{s}.rews(:,1) = subdata(:,rews1_i);
    groupdata.subdata{s}.rews(:,2) = subdata(:,rews2_i);
    groupdata.subdata{s}.trial = subdata(:,trial_i);
    
    % extra
    groupdata.subdata{s}.missed = (subdata(:,rt1_i) == -1 | subdata(:,rt2_i) == -1);
    groupdata.subdata{s}.prevmissed = [1; groupdata.subdata{s}.missed(1:(length(subdata)-1))];
    groupdata.subdata{s}.prevchoice1 = [0; groupdata.subdata{s}.choice1(1:(length(groupdata.subdata{s}.choice1)-1))];
    groupdata.subdata{s}.prevstate1 = [0; groupdata.subdata{s}.state1(1:(length(groupdata.subdata{s}.state1)-1))];
    groupdata.subdata{s}.prevstate2 = [0; groupdata.subdata{s}.state2(1:(length(groupdata.subdata{s}.state2)-1))];
    groupdata.subdata{s}.prevstake = [0; groupdata.subdata{s}.stake(1:(length(groupdata.subdata{s}.stake)-1))];
    groupdata.subdata{s}.prevwin = [-1; groupdata.subdata{s}.win(1:(length(groupdata.subdata{s}.win)-1))];
    groupdata.subdata{s}.prevpoints = [-1; groupdata.subdata{s}.points(1:(length(groupdata.subdata{s}.points)-1))];
    groupdata.subdata{s}.same = double(groupdata.subdata{s}.prevstate1 == groupdata.subdata{s}.state1);
    groupdata.subdata{s}.stay = double(groupdata.subdata{s}.prevstate2 == groupdata.subdata{s}.state2);
    
end

end
