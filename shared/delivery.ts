// Reusable delivery contracts. No client data, automatic publishing, or outbound messages.
export const BLUEPRINT_SCOPE_VERSION='maim-blueprint-v1';
export const BLUEPRINT_SCOPE={sessionMinutes:[30,45],sessions:1,deliverables:['One-page system map','Three priorities','First client-flow blueprint'],excluded:['Implementation','Ongoing coaching','Archive vault','Weekly meetings']};
export type DeliveryStatus='awaiting_intake'|'scheduled'|'active'|'blocked'|'review'|'delivered'|'paused';
export type WeeklyUpdate={workspaceId:string;period:string;completed:{title:string;why:string;source:string}[];next:{title:string;owner:string;due:string}[];blockers:{description:string;owner:string}[];status:DeliveryStatus;approvedBy?:string};
export function weeklyReport(update:WeeklyUpdate){
 if(!update.workspaceId||!update.period)throw new Error('Workspace and reporting period required');
 if(update.completed.some(x=>!x.source||!x.why))throw new Error('Every completed item needs evidence and impact');
 return [`MAIM delivery update — ${update.period}`,`Status: ${update.status}`,'Completed',...update.completed.map(x=>`${x.title}\nWhy it matters: ${x.why}\nEvidence: ${x.source}`),...(update.completed.length?[]:['No completed deliverables recorded this period.']),'Next',...update.next.map(x=>`${x.title} — ${x.owner} — ${x.due}`),'Waiting on',...update.blockers.map(x=>`${x.description} — ${x.owner}`),...(update.blockers.length?[]:['No blockers recorded.'])].join('\n\n');
}
export function mayPublishUpdate(update:WeeklyUpdate,actor:{workspaceId:string;role:string}){return actor.workspaceId===update.workspaceId && actor.role==='operator' && !!update.approvedBy;}
export type VaultAsset={workspaceId:string;assetId:string;source:string;rights:'unknown'|'private_only'|'commercial_approved';visibility:'private'|'client'|'paid';reviewed:boolean;thirdPartyConsent:boolean;};
export function maySellAsset(asset:VaultAsset,workspaceId:string){return asset.workspaceId===workspaceId&&asset.rights==='commercial_approved'&&asset.visibility==='paid'&&asset.reviewed&&asset.thirdPartyConsent;}
export function deliveryEvent(workspaceId:string,event:string){return {workspaceId,event,time:new Date().toISOString()};}
