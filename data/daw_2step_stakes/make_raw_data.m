function groupdata = make_raw_data

load('data.mat');
load('subinfo.mat');

s = 0;

stim_1_left_i = 1;
stim_1_right_i = 2;
rt_1_i = 3;
choice1_i = 4;
response1_i = 5;
stim_2_left_i = 6;
stim_2_right_i = 7;
rt_2_i = 8;
choice2_i = 9;
response2_i = 10;
win_i = 11;
state2_i = 12;
stake_i = 13;
score_i = 14;
practice_i = 15;
ps1a1_i = 16;
ps1a2_i = 17;
ps2a1_i = 18;
ps2a2_i = 19;
trial_i = 20;
time_elapsed_i = 21;

for i = 1:length(subinfo)
    
    s = s + 1;
    
    groupdata.subdata{s}.id = subinfo(i,1);
    
    subdata = cell2mat(data(strcmp(subinfo(i,1),data(:,1)),2:22));
    groupdata.nrtrials(s) = length(subdata);
        
    subdata(subdata(:,practice_i)==1,:)=[]; % no practice
    
    groupdata.subdata{s}.stim_1_left = subdata(:,stim_1_left_i);
    groupdata.subdata{s}.stim_1_right = subdata(:,stim_1_right_i);
    groupdata.subdata{s}.rt1 = subdata(:,rt_1_i);
    groupdata.subdata{s}.choice1 = subdata(:,choice1_i);
    groupdata.subdata{s}.response1 = subdata(:,response1_i);
    groupdata.subdata{s}.stim_2_left = subdata(:,stim_2_left_i);
    groupdata.subdata{s}.stim_2_right = subdata(:,stim_2_right_i);
    groupdata.subdata{s}.rt2 = subdata(:,rt_2_i);
    groupdata.subdata{s}.choice2 = subdata(:,choice2_i);
    groupdata.subdata{s}.response2 = subdata(:,response2_i);
    groupdata.subdata{s}.win = subdata(:,win_i)>0;
    groupdata.subdata{s}.state2 = subdata(:,state2_i);
    groupdata.subdata{s}.stake = subdata(:,stake_i);
    groupdata.subdata{s}.score = subdata(:,score_i);
    groupdata.subdata{s}.practice = subdata(:,practice_i);
    groupdata.subdata{s}.ps1a1 = subdata(:,ps1a1_i);
    groupdata.subdata{s}.ps1a2 = subdata(:,ps1a2_i);
    groupdata.subdata{s}.ps2a1 = subdata(:,ps2a1_i);
    groupdata.subdata{s}.ps2a2 = subdata(:,ps2a2_i);
    groupdata.subdata{s}.trial = subdata(:,trial_i);
    
    % extra 
    groupdata.subdata{s}.common = groupdata.subdata{s}.state2 == groupdata.subdata{s}.choice1;
    groupdata.subdata{s}.missed = (subdata(:,rt_1_i) == -1 | subdata(:,rt_2_i) == -1);
    groupdata.subdata{s}.prevmissed = [1; groupdata.subdata{s}.missed(1:(length(subdata)-1))];
    groupdata.subdata{s}.prevwin = [-1; groupdata.subdata{s}.win(1:(length(groupdata.subdata{s}.win)-1))];
    groupdata.subdata{s}.prevcommon = [-1; groupdata.subdata{s}.common(1:(length(groupdata.subdata{s}.common)-1))];
    groupdata.subdata{s}.prevchoice1 = [-1; groupdata.subdata{s}.choice1(1:(length(groupdata.subdata{s}.choice1)-1))];
    groupdata.subdata{s}.stay = double(groupdata.subdata{s}.prevchoice1 == groupdata.subdata{s}.choice1);
    groupdata.subdata{s}.prevresponse = [-1; groupdata.subdata{s}.response1(1:(length(groupdata.subdata{s}.response1)-1))];
    groupdata.subdata{s}.repeatresponse = double(groupdata.subdata{s}.prevresponse==groupdata.subdata{s}.response1);
    groupdata.subdata{s}.repeatchoice = double(groupdata.subdata{s}.choice1==groupdata.subdata{s}.prevchoice1);
    
    missed = (groupdata.subdata{s}.missed | groupdata.subdata{s}.prevmissed);
    prevcommon = groupdata.subdata{s}.prevcommon(~missed);
    prevwin = groupdata.subdata{s}.prevwin(~missed);
    stake = groupdata.subdata{s}.stake(~missed);
    stay = groupdata.subdata{s}.stay(~missed);
    
    prevcommon(prevcommon==0)=-1;
    prevwin(prevwin==0)=-1;
    stake(stake==1)=-1;
    stake(stake==5)=1;
    
    groupdata.subdata{s}.table = [prevwin prevcommon stake stay];
    
end

end
