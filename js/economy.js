const Economy={
 getNovaPerMinute(player,rocket){return rocket?rocket.novaPerMinute*(1+getTechnologyEffect("navigation",player.technologies?.navigation||0)*.25):0},
 addNova(player,amount){if(Number.isFinite(amount)&&amount>0)player.nova+=amount}
};