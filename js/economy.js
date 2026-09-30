const Economy={
 getNovaPerMinute(player,simulation){
  if(!simulation)return 0;
  const rates={"earth-moon":0.5,"moon-mars":1.2,"mars-jupiter":2.5,"jupiter-saturn":5,"saturn-uranus":10,"uranus-neptune":20};
  const bonus=1+(player.technologies?.fleet||0)*.05+(player.technologies?.navigation||0)*.1+(player.technologies?.fuel||0)*.05;
  return simulation.shuttles.reduce((sum,s)=>sum+(rates[s.routeId]||0),0)*bonus;
 },
 addNova(player,amount){if(Number.isFinite(amount)&&amount>0)player.nova+=amount}
};