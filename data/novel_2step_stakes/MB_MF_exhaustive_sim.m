 function  PEs = MB_MF_exhaustive_sim(x,subdata)

% parameters
b_lo = x(1);           % softmax inverse temperature
b_hi = x(2);           % softmax inverse temperature
lr_lo = x(3);          % learning rate
lr_hi = x(4);          % learning rate
lambda_lo = x(5);      % eligibility trace decay
lambda_hi = x(6);      % eligibility trace decay
w_lo = x(7);           % mixing weight
w_hi = x(8);           % mixing weight
st_lo = x(9);          % stickiness
st_hi = x(10);          % stickiness
respst_lo = x(11);          % stickiness
respst_hi = x(12);          % stickiness

% initialization
Qmf = 4.5*ones(2,2);
Q2 = 4.5*ones(2,1);                % Q(s,a): state-action value function for Q-learning
Tm = cell(2,1);
Tm{1} = [1 0; 0 1];         % transition matrix
Tm{2} = [1 0; 0 1];         % transition matrix
M = [0 0; 0 0];                 % last choice structure
R = [0; 0];                     % last choice structure
N = size(subdata.choice1);

% loop through trials
for t = 1:N
    
    if (subdata.rt1(t) == -1 || subdata.rt2(t) == -1)
        continue
    end
    
    if (subdata.stim_left(t) == 2) || (subdata.stim_left(t) == 4)
        R = flipud(R);
    end
        
    s1 = subdata.state1(t);
    s2 = subdata.state2(t);
    a = subdata.choice1(t);
    action = a;
    a = a - (s1 == 2)*(2);
    
    Qmb = Tm{s1}'*Q2;                                       % compute model-based value function
    
    if subdata.stake(t) == 1
        b = b_lo;
        w = w_lo;
        lr = lr_lo;
        lambda = lambda_lo;
        st = st_lo;
        respst = respst_lo;
    else
        b = b_hi;
        w = w_hi;
        lr = lr_hi;
        lambda = lambda_hi;
        st = st_hi;
        respst = respst_hi;
    end
    
    Q = w*Qmb + (1-w)*Qmf(s1,:)' + st.*M(s1,:)' + respst.*R;                              % mix TD and model value
        
    M = zeros(2,2);
    M(s1,a) = 1;                                              % make the last choice sticky
    
    R = zeros(2,1);
    if action == subdata.stim_left(t)
        R(1) = 1;                                                    % make the last choice sticky
    else
        R(2) = 1;
    end 
    
    dtQ(1) = Q2(s2) - Qmf(s1,a);                               % backup with actual choice (i.e., sarsa)
    Qmf(s1,a) = Qmf(s1,a) + lr*dtQ(1);                                % update TD value function
    
    dtQ(2) = subdata.points(t) - Q2(s2);                                        % prediction error (2nd choice)
    
    Q2(s2) = Q2(s2) + lr*dtQ(2);                            % update TD value function
    Qmf(s1,a) = Qmf(s1,a) + lambda*lr*dtQ(2);                     % eligibility trace
    
    PEs(t,:) = dtQ;
    
end