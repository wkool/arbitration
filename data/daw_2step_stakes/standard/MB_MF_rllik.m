function LL = MB_MF_rllik(x,subdata)

% parameters
b = x(1);           % softmax inverse temperature
lr = x(2);          % learning rate
lambda = x(3);      % eligibility trace decay
w_lo = x(4);           % mixing weight
w_hi = x(5);           % mixing weight
st = x(6);
respst = x(7);

% initialization
Qd = 0.5*ones(3,2);            % Q(s,a): state-action value function for Q-learning
Tm = [.7 .3; .3 .7];        % transition matrix
M = [0; 0];                 % last choice structure
R = [0; 0];

N = length(subdata.choice1);

LL = 0;

% loop through trials
for t = 1:N

    % Break if trial was missed
    if (subdata.choice1(t) == -1 || subdata.choice2(t) == -1)
        continue
    end
    
    state2 = subdata.state2(t)+1;
    
    if subdata.stim_1_left(t) == 2
        R = flipud(R);
    end
    
    if subdata.stake(t) == 1
        w = w_lo;
    else
        w = w_hi;
    end
    
    maxQ = max(Qd(2:3,:),[],2);                                     % optimal reward at second step
    Qm = Tm'*maxQ;                                                  % compute model-based value function

    Q = w*Qm + (1-w)*Qd(1,:)' + st.*M + respst.*R;                                                              % mix TD and model value
        
    LL = LL + b*Q(subdata.choice1(t))-logsumexp(b*Q);
    
    LL = LL + b*Qd(state2,subdata.choice2(t)) - logsumexp(b*Qd(state2,:));

    M = [0; 0];
    M(subdata.choice1(t)) = 1;                                                                      % make the last choice sticky
    
    R = zeros(2,1);
    if subdata.choice1(t) == subdata.stim_1_left(t)
        R(1) = 1;                                                    % make the last response sticky
    else
        R(2) = 1;
    end
    
    dtQ(1) = Qd(state2,subdata.choice2(t)) - Qd(1,subdata.choice1(t));                                   % backup with actual choice (i.e., sarsa)
    Qd(1,subdata.choice1(t)) = Qd(1,subdata.choice1(t)) + lr*dtQ(1);                                % update TD value function
     
    dtQ(2) = subdata.win(t) - Qd(state2,subdata.choice2(t));                                                          % prediction error (2nd choice)
    
    Qd(state2,subdata.choice2(t)) = Qd(state2,subdata.choice2(t)) + lr*dtQ(2);                                % update TD value function
    Qd(1,subdata.choice1(t)) = Qd(1,subdata.choice1(t)) + lambda*lr*dtQ(2);                         % eligibility trace
    
end

end
