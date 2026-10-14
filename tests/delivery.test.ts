import test from 'node:test';
import assert from 'node:assert/strict';
import {weeklyReport,mayPublishUpdate,maySellAsset,BLUEPRINT_SCOPE} from '../shared/delivery';
test('weekly update requires evidence, distinguishes no progress, and blocks unapproved or cross-tenant publication',()=>{
 const u={workspaceId:'synthetic-a',period:'week 1',completed:[],next:[],blockers:[],status:'active' as const};
 assert.match(weeklyReport(u),/No completed deliverables/);
 assert.throws(()=>weeklyReport({...u,completed:[{title:'Claim',source:'',why:''}]}));
 assert.equal(mayPublishUpdate(u,{workspaceId:'synthetic-a',role:'operator'}),false);
 assert.equal(mayPublishUpdate({...u,approvedBy:'reviewer'},{workspaceId:'synthetic-b',role:'operator'}),false);
 assert.equal(mayPublishUpdate({...u,approvedBy:'reviewer'},{workspaceId:'synthetic-a',role:'client'}),false);
 assert.equal(mayPublishUpdate({...u,approvedBy:'reviewer'},{workspaceId:'synthetic-a',role:'operator'}),true);
 assert.equal(BLUEPRINT_SCOPE.sessions,1);
});
test('vault commercial access requires matching tenant, approved rights, review, and third-party consent',()=>{
 const a={workspaceId:'synthetic-a',assetId:'asset',source:'synthetic',rights:'commercial_approved' as const,visibility:'paid' as const,reviewed:true,thirdPartyConsent:true};
 assert.equal(maySellAsset(a,'synthetic-a'),true);
 assert.equal(maySellAsset(a,'synthetic-b'),false);
 assert.equal(maySellAsset({...a,rights:'unknown'},'synthetic-a'),false);
 assert.equal(maySellAsset({...a,thirdPartyConsent:false},'synthetic-a'),false);
 assert.equal(maySellAsset({...a,reviewed:false},'synthetic-a'),false);
});
