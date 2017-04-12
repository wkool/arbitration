function groupdata = groupanalysis

groupdata = make_raw_data;

if exist('standard/results.mat','file')
    standard_results = load('standard/results.mat');
    groupdata.fits = standard_results.results;
end

if exist('standard/results.mat','file')
    exhaustive_results = load('exhaustive/results.mat');
    groupdata.exhaustive_fits = exhaustive_results.results;
end

nrsubs = length(groupdata.subdata);

T = [];

s = 0;

for i = 1:nrsubs
    
    subdata = groupdata.subdata{i};
    
    if sum(subdata.missed) < 40
        
        s = s+1;
        
        groupdata.i(s,1) = i;
        
        groupdata.missed(s,1) = sum(subdata.missed);
        groupdata.rewardrate(s,1) = mean(subdata.points);
        groupdata.avg_rew(s,1) = mean(subdata.rews(:));
        groupdata.rewardrate_corrected(s,1) = groupdata.rewardrate(s,1) - groupdata.avg_rew(s,1);
        groupdata.score(s,1) = subdata.score(200);
        
        if exist('standard_results','var')
            
            groupdata.w(s,:) = standard_results.results.x(s,4:5);
            
            PEs = MB_MF_standard_sim(standard_results.results.x(s,:),subdata);
            
            pe = PEs(:,2)>0;
            
            prevpe = [0; pe(1:(length(pe)-1))];
            prevpe = prevpe(~(subdata.missed|subdata.prevmissed));
            stake = subdata.stake(~(subdata.missed|subdata.prevmissed));
            same = subdata.same(~(subdata.missed|subdata.prevmissed));
            stay = subdata.stay(~(subdata.missed|subdata.prevmissed));
            
            groupdata.mb_component(s,1) = mean(stay((prevpe>0)&(stake==1)))-mean(stay((prevpe<=0)&(stake==1)));  % low-stakes
            groupdata.mb_component(s,2) = mean(stay((prevpe)&(stake==5)))-mean(stay((~prevpe)&(stake==5)));  % high-stakes
            
            stake(stake==1) = -1;
            prevpe = double(prevpe);
            prevpe(prevpe==0) = -1;
            same = double(same);
            same(same==0) = -1;
            
            T = [T; s*ones(length(stake),1) prevpe same stake stay];
            
        end
        
        if exist('exhaustive_results','var')
            groupdata.w_exhaustive(s,:) = exhaustive_results.results.x(s,7:8);
        end
        
    end
    
end

if exist('standard_results','var')
    
    groupdata.table = table(T(:,1),T(:,2),T(:,3),T(:,4),T(:,5),'VariableNames',{'subnr' 'prevpe' 'same' 'stake' 'stay'});
    groupdata.glme = fitglme(groupdata.table,'stay~prevpe*same*stake + (prevpe*same*stake|subnr)','Distribution','Binomial');
    
end

end

