const Economy={
 getNovaPerMinute(player,rocket){if(!rocket)return 0;const tech=1+getTechnologyEffect("speed",player.technologies.speed)*0;return rocket.novaPerMinute*(1+getTechnologyEffect("navigation",player.technologies.navigation)*.25)*tech},
 addNova(player,amount){if(Number.isFinite(amount)&&amount>0)player.nova+=amount}
};