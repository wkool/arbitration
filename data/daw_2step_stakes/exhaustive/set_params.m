function [param] = set_params

% create parameter structure
g = [4.82 0.88];  % parameters of the gamma prior
param(1).name = 'inverse temperature lo';
param(1).logpdf = @(x) sum(log(gampdf(x,g(1),g(2))));  % log density function for prior
param(1).lb = 0;   % lower bound
param(1).ub = 20;  % upper bound

g = [4.82 0.88];  % parameters of the gamma prior
param(2).name = 'inverse temperature hi';
param(2).logpdf = @(x) sum(log(gampdf(x,g(1),g(2))));  % log density function for prior
param(2).lb = 0;   % lower bound
param(2).ub = 20;  % upper bound

param(3).name = 'learning rate lo';
param(3).logpdf = @(x) 0;
param(3).lb = 0;
param(3).ub = 1;

param(4).name = 'learning rate hi';
param(4).logpdf = @(x) 0;
param(4).lb = 0;
param(4).ub = 1;

param(5).name = 'eligibility trace decay lo';
param(5).logpdf = @(x) 0;
param(5).lb = 0;
param(5).ub = 1;

param(6).name = 'eligibility trace decay hi';
param(6).logpdf = @(x) 0;
param(6).lb = 0;
param(6).ub = 1;

param(7).name = 'mixing weight low';
param(7).logpdf = @(x) 0;
param(7).lb = 0;
param(7).ub = 1;

param(8).name = 'mixing weight high';
param(8).logpdf = @(x) 0;
param(8).lb = 0;
param(8).ub = 1;

mu = 0.15; sd = 1.42;   % parameters of choice stickiness
param(9).name = 'choice stickiness lo';
param(9).logpdf = @(x) sum(log(normpdf(x,mu,sd)));
param(9).lb = -20;
param(9).ub = 20;

param(10).name = 'choice stickiness hi';
param(10).logpdf = @(x) sum(log(normpdf(x,mu,sd)));
param(10).lb = -20;
param(10).ub = 20;

mu = 0.15; sd = 1.42;    % parameters of response stickiness
param(11).name = 'response stickiness lo';
param(11).logpdf = @(x) sum(log(normpdf(x,mu,sd)));
param(11).lb = -20;
param(11).ub = 20;

param(12).name = 'response stickiness hi';
param(12).logpdf = @(x) sum(log(normpdf(x,mu,sd)));
param(12).lb = -20;
param(12).ub = 20;

end
