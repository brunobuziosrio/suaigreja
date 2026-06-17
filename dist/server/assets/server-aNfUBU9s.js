import { AsyncLocalStorage } from "node:async_hooks";
import { H3Event, toResponse, getRequestHost as getRequestHost$1 } from "h3-v2";
import { rootRouteId, parseRedirect, isRedirect, defaultSerovalPlugins, makeSerovalPlugin, createRawStreamRPCPlugin, invariant, isNotFound, getScriptPreloadAttrs, getStylesheetHref, resolveManifestCssLink, resolveManifestAssetLink, createSerializationAdapter, isResolvedRedirect, executeRewriteInput } from "@tanstack/router-core";
import { toCrossJSONStream, fromJSON, toCrossJSONAsync } from "seroval";
import { createMemoryHistory } from "@tanstack/history";
import { mergeHeaders } from "@tanstack/router-core/ssr/client";
import { getNormalizedURL, getOrigin, normalizeSsrResponse, attachRouterServerSsrUtils, replaceSsrResponse, stripSsrResponseBody, isSsrResponse } from "@tanstack/router-core/ssr/server";
import "react";
import { RouterProvider } from "@tanstack/react-router";
import { jsx } from "react/jsx-runtime";
import { defineHandlerCallback, renderRouterToStream } from "@tanstack/react-router/ssr/server";
function StartServer(props) {
  return /* @__PURE__ */ jsx(RouterProvider, { router: props.router });
}
var defaultStreamHandler = defineHandlerCallback(({ request, router, responseHeaders }) => renderRouterToStream({
  request,
  router,
  responseHeaders,
  children: /* @__PURE__ */ jsx(StartServer, { router })
}));
var GLOBAL_EVENT_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:event-storage");
var globalObj$1 = globalThis;
if (!globalObj$1[GLOBAL_EVENT_STORAGE_KEY]) globalObj$1[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
var eventStorage = globalObj$1[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function getSetCookieValues(headers) {
  const headersWithSetCookie = headers;
  if (typeof headersWithSetCookie.getSetCookie === "function") return headersWithSetCookie.getSetCookie();
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
  if (response.ok) return;
  const eventSetCookies = getSetCookieValues(event.res.headers);
  if (eventSetCookies.length === 0) return;
  const responseSetCookies = getSetCookieValues(response.headers);
  response.headers.delete("set-cookie");
  for (const cookie of responseSetCookies) response.headers.append("set-cookie", cookie);
  for (const cookie of eventSetCookies) response.headers.append("set-cookie", cookie);
}
function attachResponseHeaders(value, event) {
  if (isPromiseLike(value)) return value.then((resolved) => {
    if (resolved instanceof Response) mergeEventResponseHeaders(resolved, event);
    return resolved;
  });
  if (value instanceof Response) mergeEventResponseHeaders(value, event);
  return value;
}
function requestHandler(handler) {
  return (request, requestOpts) => {
    let h3Event;
    try {
      h3Event = new H3Event(request);
    } catch (error) {
      if (error instanceof URIError) return new Response(null, {
        status: 400,
        statusText: "Bad Request"
      });
      throw error;
    }
    return toResponse(attachResponseHeaders(eventStorage.run({ h3Event }, () => handler(request, requestOpts)), h3Event), h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) throw new Error(`No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return event.h3Event;
}
function getRequest() {
  return getH3Event().req;
}
function getRequestHost(opts) {
  return getRequestHost$1(getH3Event(), opts);
}
function setResponseHeaders(headers) {
  const event = getH3Event();
  for (const [name, value] of Object.entries(headers)) event.res.headers.set(name, value);
}
function getResponse() {
  return getH3Event().res;
}
var HEADERS = { TSS_SHELL: "X-TSS_SHELL" };
async function getStartManifest(matchedRoutes) {
  const { tsrStartManifest } = await import("./_tanstack-start-manifest_v-BwZqK8pn.js");
  const startManifest = tsrStartManifest();
  let routes = startManifest.routes;
  routes[rootRouteId];
  const manifestRoutes = {};
  for (const k in routes) {
    const v = routes[k];
    const result = {};
    if (v.preloads && v.preloads.length > 0) result.preloads = v.preloads;
    if (v.scripts && v.scripts.length > 0) result.scripts = v.scripts;
    if (v.css?.length) result.css = v.css;
    if (result.preloads || result.scripts || result.css) manifestRoutes[k] = result;
  }
  return {
    ...startManifest.scriptFormat ? { scriptFormat: startManifest.scriptFormat } : {},
    ...startManifest.inlineCss ? { inlineCss: startManifest.inlineCss } : {},
    routes: manifestRoutes
  };
}
const manifest = {
  "04faf4c4a0e2edce2f423d8c9636b5c5557cba2527599165ce84be309e6080ba": {
    functionName: "deleteEbdClass_createServerFn_handler",
    importer: () => import("./ebd.functions-N_DpzzSj.js")
  },
  "057df525a4aa1f7cda5c1a39650071f2e55e7a828f2712cec7d214cd5fb17af7": {
    functionName: "listMyDonationCampaigns_createServerFn_handler",
    importer: () => import("./donations.functions-CEdg0DMY.js")
  },
  "079ea5a3a43f69a92f2de925a8e096166a63d6c04eadbd6c11f1f686ea4f9c05": {
    functionName: "listDonationsByCampaign_createServerFn_handler",
    importer: () => import("./donations.functions-CEdg0DMY.js")
  },
  "081a0291789d3968e51cab4f4411c5bab8332e0154a83745f0dcf0f0012c5a15": {
    functionName: "getPublicPrayers_createServerFn_handler",
    importer: () => import("./prayer.functions-cOVSQCAz.js")
  },
  "0b1a7d021059e2e95a4ad3e2dbce72fb3f3a072ad3df6f9c01224a304c931196": {
    functionName: "getWhatsappData_createServerFn_handler",
    importer: () => import("./whatsapp.functions-CwJcT_Vt.js")
  },
  "0ca46ef0a035843e32280cb461ffa894fc39dcbaec8aa25e4a7f94cbdc5ca058": {
    functionName: "countTestData_createServerFn_handler",
    importer: () => import("./admin.functions-tQOfa-hJ.js")
  },
  "0dbcdb0249b0ffe1d46fbc680a516566217d1c4a5c2133c629b7a3c1b48ad9e6": {
    functionName: "uploadHubAsset_createServerFn_handler",
    importer: () => import("./hub.functions-CjF2fV3O.js")
  },
  "0f8095683ab6925e7aebf2affb0583658496cfec94ccb32446e0eaf236c56a33": {
    functionName: "getTodayDevotional_createServerFn_handler",
    importer: () => import("./devotionals.functions-BRL41idB.js")
  },
  "129f9f8bed05d7e2261e8327f43116d10056f5d3e550267d5fee438d14323f19": {
    functionName: "listEventRegistrations_createServerFn_handler",
    importer: () => import("./event-pages.functions-BcDjSveu.js")
  },
  "172eae4784224f3149420f5a20758ac94ad509831aeb225d075486739f56ed1c": {
    functionName: "publicCheckin_createServerFn_handler",
    importer: () => import("./checkin.functions-CS_vinEU.js")
  },
  "187b9e6107ae08a9b0ce45cfa5fa508d245e655a2016371d706a5d287c92feac": {
    functionName: "updateVisitorNotes_createServerFn_handler",
    importer: () => import("./visitors.functions-BtddFAZF.js")
  },
  "18f75a4b6606747bfe37901a1d64507e9d468b34c5dfc4992c6bb7beefd72ae5": {
    functionName: "listEventPages_createServerFn_handler",
    importer: () => import("./event-pages.functions-BcDjSveu.js")
  },
  "1b7e5b400025e5852038477f99f170afd92d610e72dd959a007bc8e05fc4c8dc": {
    functionName: "getHubChrome_createServerFn_handler",
    importer: () => import("./hub.functions-CjF2fV3O.js")
  },
  "1e81932655f857b6e4134c3df07a6a26a64b9fc7f0b1134afe51bc4c00ca04a5": {
    functionName: "deleteDevotional_createServerFn_handler",
    importer: () => import("./devotionals.functions-BRL41idB.js")
  },
  "1f96c94754b775e930ea8c210109676d5239082be7fdfd0e0a356d0dfdff44eb": {
    functionName: "prayForRequest_createServerFn_handler",
    importer: () => import("./prayer.functions-cOVSQCAz.js")
  },
  "21a5d2452424aa2f06825ae4bade4822073d9792037827ca81fd180facab58f6": {
    functionName: "getPublicCheckinSession_createServerFn_handler",
    importer: () => import("./checkin.functions-CS_vinEU.js")
  },
  "24bfad6b7472d3c53d57aa03340c5619c3f6925ec5e9858cb82b656426a6458b": {
    functionName: "listMyNews_createServerFn_handler",
    importer: () => import("./hub.functions-CjF2fV3O.js")
  },
  "256d42016a62e72319c16cb2bc0fe7510a00007df272863e03d9cdfc74c09e77": {
    functionName: "upsertDonationCampaign_createServerFn_handler",
    importer: () => import("./donations.functions-CEdg0DMY.js")
  },
  "283032f1601f931ed9ccc7df9ec903a2b23ecdea2a8d5ff032cf36f717d315da": {
    functionName: "deleteEvent_createServerFn_handler",
    importer: () => import("./events.functions-Cl-FnDbS.js")
  },
  "2911d88f499536c6a19e67e77c05c26360f3441e7e72d5d701aefe7bfd50feee": {
    functionName: "getAttendanceStats_createServerFn_handler",
    importer: () => import("./ebd.functions-N_DpzzSj.js")
  },
  "2b3a6d41dc6818c4d642f5d8f52b3d02a593df6588ab61399b6e78011731dd4b": {
    functionName: "getInstagramConnection_createServerFn_handler",
    importer: () => import("./instagram.functions-96UhR08s.js")
  },
  "2e1a0d48676dbc5fcec2496b5698e80e49ebe4b6de796512c8430840cb15ae7b": {
    functionName: "submitPrayerRequest_createServerFn_handler",
    importer: () => import("./prayer.functions-cOVSQCAz.js")
  },
  "2ea37dbf5f02b1cc4bb63189b76a5fcc02ad4305f527ac76edf77953726625cd": {
    functionName: "upsertMemberDocument_createServerFn_handler",
    importer: () => import("./documents.functions-jWFzpTM6.js")
  },
  "2eefd65801379873095e5cce02aafd1864a0c52547e6048bb1dd5f4c53bc011e": {
    functionName: "getDonationsMonthlyReport_createServerFn_handler",
    importer: () => import("./donations.functions-CEdg0DMY.js")
  },
  "2f1869deef1bc6f11b155c519b403c469617c676c441ba10c2a6da5fcd75bc0b": {
    functionName: "getPublicAgenda_createServerFn_handler",
    importer: () => import("./public-agenda.functions-CSL3qQ51.js")
  },
  "3381839750ac935343d825f770b53a5a03071fd4f8e93d4065288be7bd4d760a": {
    functionName: "listEnrollments_createServerFn_handler",
    importer: () => import("./ebd.functions-N_DpzzSj.js")
  },
  "351ffc6fd93f5e4fceb008f915473d11e5ed1acc4570a9726ee7cc26e5fefcbd": {
    functionName: "getRegistrationPayment_createServerFn_handler",
    importer: () => import("./event-pages.functions-BcDjSveu.js")
  },
  "3c88e63965157bf211fa6180dfade4e139ed6da899205b0d9c33ee9f5dd531f2": {
    functionName: "saveEventPage_createServerFn_handler",
    importer: () => import("./event-pages.functions-BcDjSveu.js")
  },
  "3edb9c95c6e958d143255a04b67bef1ed75f9aa86a06db65952928fc39691d81": {
    functionName: "updateAccountSubscription_createServerFn_handler",
    importer: () => import("./admin.functions-tQOfa-hJ.js")
  },
  "41d78a2a8bf3c02d62aab24813f733f15cc4f9b75694f8667141f3ad02073782": {
    functionName: "updatePrayerStatus_createServerFn_handler",
    importer: () => import("./prayer.functions-cOVSQCAz.js")
  },
  "45c12f7920aed087d41dc046b2ec0085f1afab9a74d2d597a5b01f5f36be9324": {
    functionName: "listVisitors_createServerFn_handler",
    importer: () => import("./visitors.functions-BtddFAZF.js")
  },
  "4743b930ba36aad65ce5e1b70840d533085e526195d6d6b8083d6a25cc4034a4": {
    functionName: "upsertEbdClass_createServerFn_handler",
    importer: () => import("./ebd.functions-N_DpzzSj.js")
  },
  "477f098ee3444a24ea9390245fb4dc46f7f2891ee1547f7ae3387f83324856fb": {
    functionName: "saveMercadoPagoConnection_createServerFn_handler",
    importer: () => import("./mercadopago-connections.functions-Di_kG6ds.js")
  },
  "48ed0650c06125c6742264f9c6fe66713f81f0b5e2b0e3fbe5f535d1ec97bff3": {
    functionName: "upsertCheckinSession_createServerFn_handler",
    importer: () => import("./checkin.functions-CS_vinEU.js")
  },
  "4b5430ce98b070199c8632b0738b0a720cd9e7fc1b0ef1c7e5c6ece951710c5a": {
    functionName: "submitVisitor_createServerFn_handler",
    importer: () => import("./visitors.functions-BtddFAZF.js")
  },
  "4b620a3cd65805f5e944347844894d2350dfd2193f663c1562d679604c9fce66": {
    functionName: "listMySuggestions_createServerFn_handler",
    importer: () => import("./feedback.functions-BfkAGG1c.js")
  },
  "4e5f16d0674dc70e7ec7c65599f37d638f882ede958c5f416c025b6597243571": {
    functionName: "getAttendanceForDate_createServerFn_handler",
    importer: () => import("./ebd.functions-N_DpzzSj.js")
  },
  "4f1c301f3b19a78b2343eee91833dc4c887022b1d9f4ccc774e4507bbbd44c8d": {
    functionName: "getPublicDonations_createServerFn_handler",
    importer: () => import("./donations.functions-CEdg0DMY.js")
  },
  "5066297d56e7d337c91702997c269ac30924387d613a1b2d901701e9e5bf61e4": {
    functionName: "getMyAccount_createServerFn_handler",
    importer: () => import("./account.functions-C4CPPqGk.js")
  },
  "51146209d2403523b2b68e3d85efa07b33e76f5d66cbcee49d08388de46ef61b": {
    functionName: "listPrayerRequests_createServerFn_handler",
    importer: () => import("./prayer.functions-cOVSQCAz.js")
  },
  "514f5210ea460b4733a80082389a266355cd01a46b70486d386ea969b4e5306a": {
    functionName: "listCheckinSessions_createServerFn_handler",
    importer: () => import("./checkin.functions-CS_vinEU.js")
  },
  "51ad93d03c52987e0e52d0164e41771f8765a8919d8a537367eaf795dff9b9d8": {
    functionName: "listProducts_createServerFn_handler",
    importer: () => import("./products.functions-BaE9KThl.js")
  },
  "520e2a8e6553eb7091205dfb29f8c13213d4452935c7a2bf94c68581db130295": {
    functionName: "updateHubSettings_createServerFn_handler",
    importer: () => import("./hub.functions-CjF2fV3O.js")
  },
  "5b448930e7d8a50902350c96b3476fa4817cbd2a62842dd3ade89e44455afd1f": {
    functionName: "updateCustomSlug_createServerFn_handler",
    importer: () => import("./account.functions-C4CPPqGk.js")
  },
  "5ce55c471ba0a4d7322b30677fa19e82a84bf896ad51956914006552444644c1": {
    functionName: "getCheckinMonthly_createServerFn_handler",
    importer: () => import("./reports.functions-fOvGFobz.js")
  },
  "60f7e8c23d47adace97bc8dcd3759ef7054d057d8b8088d100438fe8e78143c8": {
    functionName: "getSmallGroupsReport_createServerFn_handler",
    importer: () => import("./reports.functions-fOvGFobz.js")
  },
  "64c86fc6bb4f1706a4fdab294f6568b13c13fc880f3638afcd805f16ee683451": {
    functionName: "getPublicMemberCard_createServerFn_handler",
    importer: () => import("./members.functions-B0XMWqOo.js")
  },
  "65386349d6700f5b00a7ee9ee7d31022ece5f340f6221a4ee6531310b6ddc01d": {
    functionName: "adminListProducts_createServerFn_handler",
    importer: () => import("./admin-products.functions-OWz6bGE-.js")
  },
  "656b2725ba30b01798af4865aac02024ecbf26cc5c564a1bb572b4e209ebc8dc": {
    functionName: "listCheckinEntries_createServerFn_handler",
    importer: () => import("./checkin.functions-CS_vinEU.js")
  },
  "65cb4918752aab1517a2ca65b68dd3b02e470fb48c5d92a5dbedb52e4be449b3": {
    functionName: "getPublicEventPage_createServerFn_handler",
    importer: () => import("./event-pages.functions-BcDjSveu.js")
  },
  "65d3fee73cb0dda3526224a34503a0a57990817b3d1a080677a33e8d08c85364": {
    functionName: "getPublicDonationReceipt_createServerFn_handler",
    importer: () => import("./donations.functions-CEdg0DMY.js")
  },
  "6aed5c7bafc6fe6ac6bff5d14bcd75c464264911ca8bd5e2669fd8a862fef60c": {
    functionName: "deleteLocation_createServerFn_handler",
    importer: () => import("./locations.functions-CZPBWzWP.js")
  },
  "6ba7348804860fe1130a990c092d065448a312d9d53003d73c190e393af98848": {
    functionName: "getPublicInstagramPosts_createServerFn_handler",
    importer: () => import("./instagram.functions-96UhR08s.js")
  },
  "6eb89a05f6dfdb2f8c66b594f0bc454393b14a13f25b944d3756770af6bca129": {
    functionName: "listMyPayments_createServerFn_handler",
    importer: () => import("./billing.functions-DIRX8f30.js")
  },
  "7379c03d4faec14278dfe53579562ed3fdfa1ad081c2241db06888ccb7c9df3d": {
    functionName: "upsertDevotional_createServerFn_handler",
    importer: () => import("./devotionals.functions-BRL41idB.js")
  },
  "75abccc4853c268405b494314fb5cab2d18f5c761248a6990649b60b6969b3ac": {
    functionName: "listLocations_createServerFn_handler",
    importer: () => import("./locations.functions-CZPBWzWP.js")
  },
  "7822ffc6547e06ca58edd006cd4a93f7f73629aab0483330b41f6096fd04724a": {
    functionName: "generateTestData_createServerFn_handler",
    importer: () => import("./admin.functions-tQOfa-hJ.js")
  },
  "792ed849e53a88e2a75aabd128f78503e1b0368d9a172614ddbf47e991f75e76": {
    functionName: "createSuggestion_createServerFn_handler",
    importer: () => import("./feedback.functions-BfkAGG1c.js")
  },
  "79466d9522d15e0e14302d89f5751b254d3cc241575ad94fb88282f8a3ac55db": {
    functionName: "recordAttendance_createServerFn_handler",
    importer: () => import("./ebd.functions-N_DpzzSj.js")
  },
  "7992fad4d1a022c081642c3ff7dfc32be00f28f417d8f5d1697ebc5191f9a91c": {
    functionName: "deleteDonationCampaign_createServerFn_handler",
    importer: () => import("./donations.functions-CEdg0DMY.js")
  },
  "7d82a60efe5bf0af48533cb674c02701532d3f0f452109a357478871ae420b25": {
    functionName: "deleteMemberDocument_createServerFn_handler",
    importer: () => import("./documents.functions-jWFzpTM6.js")
  },
  "7df71b07a4f1953c3a83b670761362b57ab987131317823f7e2c2b85c4524ea5": {
    functionName: "adminDeleteProduct_createServerFn_handler",
    importer: () => import("./admin-products.functions-OWz6bGE-.js")
  },
  "7ea1a88bdba63f836dfc258e21fb6d4ab6e256d4e02b92f0189dff2849cc36f3": {
    functionName: "completeOnboarding_createServerFn_handler",
    importer: () => import("./account.functions-C4CPPqGk.js")
  },
  "80a20e7e47c16b99b16baeaea94307b0f4e0551d5dec78930ca3d0e4ce2f2bdb": {
    functionName: "adminUpdateBranding_createServerFn_handler",
    importer: () => import("./branding.functions-Du0kwUdO.js")
  },
  "8109db9f4bd82d3b6c7de381f60de5439c66721eabc0e77d9e6069e2fda9a150": {
    functionName: "listSmallGroups_createServerFn_handler",
    importer: () => import("./small-groups.functions-ZJqebR_i.js")
  },
  "860702f08f127cbd5a89b9b6303462c1b38236fb5653282423d0d5920666cea6": {
    functionName: "upsertLiveStreamOverride_createServerFn_handler",
    importer: () => import("./live-streams.functions-3dfXu21c.js")
  },
  "8630dbc933fd37e262b4e12d2f3d872918fcb3a820867b983891641c26986b62": {
    functionName: "listTypes_createServerFn_handler",
    importer: () => import("./types.functions-ikdWf1JC.js")
  },
  "87037d8d19c6b09f69d9449c01a01a46c3dbaec3cad2f15eda70218bfc3c962d": {
    functionName: "getDonationCampaignStats_createServerFn_handler",
    importer: () => import("./donations.functions-CEdg0DMY.js")
  },
  "880b26f143e8525de3dd9db731e9ee5f5934f9412a6d8c0ee6ef3ec51205fa29": {
    functionName: "deleteMember_createServerFn_handler",
    importer: () => import("./members.functions-B0XMWqOo.js")
  },
  "8894fe714735b86f9977ddbbfdeb47120917d0b9dd5dffe09b5eb5357e078811": {
    functionName: "upsertNews_createServerFn_handler",
    importer: () => import("./hub.functions-CjF2fV3O.js")
  },
  "8defb47fa5aefe3f234948ee19ff962e347b3cad06bdf60069fb494c624a03dc": {
    functionName: "enqueueWhatsappMessage_createServerFn_handler",
    importer: () => import("./whatsapp.functions-CwJcT_Vt.js")
  },
  "8ec3a24cdfc816c6a99237bbadf5c75ae0affc14e8a68ec0663a4f7dc5edbfa9": {
    functionName: "getIsAdmin_createServerFn_handler",
    importer: () => import("./admin.functions-tQOfa-hJ.js")
  },
  "8f918e9fafc40762cd9ceb133e59d2f827199bcd9170396a299a3081c6582126": {
    functionName: "upsertSmallGroup_createServerFn_handler",
    importer: () => import("./small-groups.functions-ZJqebR_i.js")
  },
  "91b2ee6bfe866a4cbe677f5030e9aff4e15aa97dee4de00b4367b04162c935bc": {
    functionName: "getPlatformPaymentSettings_createServerFn_handler",
    importer: () => import("./admin-payment-settings.functions-oOlYYwO7.js")
  },
  "91d42bc5cae84af8af0f00717f09022218898f7aa48732459ea5f2ee39896736": {
    functionName: "deleteQueuedWhatsappMessage_createServerFn_handler",
    importer: () => import("./whatsapp.functions-CwJcT_Vt.js")
  },
  "934a19e0a64899030ca094a104b50f8fc2c2f2533d480be67184ceddaf6faaf0": {
    functionName: "getProductBySlug_createServerFn_handler",
    importer: () => import("./products.functions-BaE9KThl.js")
  },
  "96e03f61931eb7c243384fbe6d08294f255a3b20c178b619cad5ee7e586157cf": {
    functionName: "deleteSuggestion_createServerFn_handler",
    importer: () => import("./feedback.functions-BfkAGG1c.js")
  },
  "986c5863971bf59042ca406d64258ef5b6a01d4d667995955ed161324d966e88": {
    functionName: "deleteVisitor_createServerFn_handler",
    importer: () => import("./visitors.functions-BtddFAZF.js")
  },
  "98f25de12fe735399d11024af4f494ba9e05d00785e09eaea3b80c9bfeb5525e": {
    functionName: "saveVisitorSettings_createServerFn_handler",
    importer: () => import("./visitors.functions-BtddFAZF.js")
  },
  "995253a1c82ea2f98b207984482cb910589d1e85398f12c28f7833c9546e5525": {
    functionName: "disconnectInstagram_createServerFn_handler",
    importer: () => import("./instagram.functions-96UhR08s.js")
  },
  "9baedc754f9abe6e0bc74138ec477e275590543cb6654601d0cf125fb2c54170": {
    functionName: "listAllAccounts_createServerFn_handler",
    importer: () => import("./admin.functions-tQOfa-hJ.js")
  },
  "9bfec0e40bfc14620d9709280eeda6476af6aff12f38578456c6fcb50e6a265b": {
    functionName: "listAllSuggestions_createServerFn_handler",
    importer: () => import("./feedback.functions-BfkAGG1c.js")
  },
  "9e68731ce0df65c92e4c561cc078f114fd4a0f7a57671058e17c7777e2958f28": {
    functionName: "updatePlatformPaymentSettings_createServerFn_handler",
    importer: () => import("./admin-payment-settings.functions-oOlYYwO7.js")
  },
  "a2061ef4eb54de177a9f0edbfb4fcbbc4a00519a56ae6157ddebcff4bd3db008": {
    functionName: "createProductPixPayment_createServerFn_handler",
    importer: () => import("./products.functions-BaE9KThl.js")
  },
  "a5483ba61a40e70deefe5cd39c28f5e1619a298c48ae355e7f277f4873f56aa6": {
    functionName: "getBillingSetup_createServerFn_handler",
    importer: () => import("./billing.functions-DIRX8f30.js")
  },
  "a559b56dc36487c8c22e1e3efc70c4d4b19abf5084b3eb8c5ea8e5b6ec7a5460": {
    functionName: "createSystemUpdate_createServerFn_handler",
    importer: () => import("./feedback.functions-BfkAGG1c.js")
  },
  "a7d67100242bef50c701aa6353f07dc0ac44d0d1c6f6c78075922f2fd2a617a6": {
    functionName: "getVisitorSettings_createServerFn_handler",
    importer: () => import("./visitors.functions-BtddFAZF.js")
  },
  "a807cc612cbbbba0c7d94dfdce7e3e9ceb087679951fb8fe87038e6e6ff5aeac": {
    functionName: "deleteCheckinSession_createServerFn_handler",
    importer: () => import("./checkin.functions-CS_vinEU.js")
  },
  "ae14dc8bad5838c4b60c568fb2414608a473cdf130ad1d6a9f2ee980dd8965f8": {
    functionName: "updateAccountSettings_createServerFn_handler",
    importer: () => import("./account.functions-C4CPPqGk.js")
  },
  "b34310bca8f55380afd281a367603f74bd557965a485e99a788adf1bfae73afe": {
    functionName: "getPublicNewsPost_createServerFn_handler",
    importer: () => import("./hub.functions-CjF2fV3O.js")
  },
  "b4008e1dab8f405a0e12078ac68dda98a239edaa35fe1f8bfee30adaea9274ba": {
    functionName: "adminUpdateAccountName_createServerFn_handler",
    importer: () => import("./admin.functions-tQOfa-hJ.js")
  },
  "b4ab6fdd475a5e269db098380b97b7e982cf9489646a8c8871d5e3ae400064b0": {
    functionName: "listSystemUpdates_createServerFn_handler",
    importer: () => import("./feedback.functions-BfkAGG1c.js")
  },
  "b5609fa6a5a6f88d2940311e39206a2b95e960f8bc229ac06ff3944be0bb2055": {
    functionName: "generateDonationPix_createServerFn_handler",
    importer: () => import("./donations.functions-CEdg0DMY.js")
  },
  "b7f69ca8c31846e3e8e27a7ded678ada2faeaaaa74d025348bd7d70d7e81d0f1": {
    functionName: "listMembers_createServerFn_handler",
    importer: () => import("./members.functions-B0XMWqOo.js")
  },
  "b95adc4d43bc4011e33e97fb5fad6d2eb5d67a42768242e85e5c57544393eeb0": {
    functionName: "listDevotionals_createServerFn_handler",
    importer: () => import("./devotionals.functions-BRL41idB.js")
  },
  "bbb28bdec19643272ad0a0b859eb49f7ccaee5933c708270c05eb63cc34ef226": {
    functionName: "upsertLiveStream_createServerFn_handler",
    importer: () => import("./live-streams.functions-3dfXu21c.js")
  },
  "bdf01295617cad23066a31e82f26251fbdfa906f69f952b1315d95f1f6d98f86": {
    functionName: "upsertMember_createServerFn_handler",
    importer: () => import("./members.functions-B0XMWqOo.js")
  },
  "bdf06463391e0f38ffb2f7cbe5a89e8154db435190f58dbc561b9d635966daad": {
    functionName: "getMembersWithDonations_createServerFn_handler",
    importer: () => import("./_authenticated.finances-Cmzcj-rX.js")
  },
  "bed65d7c2e6ff2d5aec73e1397bfd52cb63c48bd55870a35e52d1e6ab51e1135": {
    functionName: "getPublicHub_createServerFn_handler",
    importer: () => import("./hub.functions-CjF2fV3O.js")
  },
  "c043c96ec360e9f56ad9697fd1e3104373e5a12cee2ad4eb5bc6073a8b10ba8f": {
    functionName: "adminSaveProduct_createServerFn_handler",
    importer: () => import("./admin-products.functions-OWz6bGE-.js")
  },
  "c17234f15eaf7f37f21c54a5e2e20dc44d866d83cf613833da65d41de5999e2b": {
    functionName: "deleteLiveStream_createServerFn_handler",
    importer: () => import("./live-streams.functions-3dfXu21c.js")
  },
  "c6c3050e76f6a3dfc8d5d2ac54e072621bfa1f2f6d5d769b0049bda3381525f9": {
    functionName: "listEvents_createServerFn_handler",
    importer: () => import("./events.functions-Cl-FnDbS.js")
  },
  "c811fd7db0f106c9d94cb23fd4e3eab5b55f4e7f7cde516bebac94e470fb740a": {
    functionName: "startInstagramConnect_createServerFn_handler",
    importer: () => import("./instagram.functions-96UhR08s.js")
  },
  "cf5e587c0afee1db7e66fbff466812e122fef819b698de6b979956f73ded1429": {
    functionName: "checkSlugAvailability_createServerFn_handler",
    importer: () => import("./account.functions-C4CPPqGk.js")
  },
  "cf9dc24cd8709d1b7e869e41282d21a3d35b9a81ee128142a78e931b606c4754": {
    functionName: "listMemberDocuments_createServerFn_handler",
    importer: () => import("./documents.functions-jWFzpTM6.js")
  },
  "cfcdf74e97663be5fef33a1032891954031b66716f063dbd46be989c49a205e2": {
    functionName: "deleteTestData_createServerFn_handler",
    importer: () => import("./admin.functions-tQOfa-hJ.js")
  },
  "d0ac6a5d4a4bf41fc45a95f8d623b1b88943f5e2a7254fa6edbb28aa4b1b5885": {
    functionName: "setEnrollment_createServerFn_handler",
    importer: () => import("./ebd.functions-N_DpzzSj.js")
  },
  "d2698d757da9e7ab3735f3cc22ae08e6dbd5cc3dc42d0fc644a05092413d7de1": {
    functionName: "upsertType_createServerFn_handler",
    importer: () => import("./types.functions-ikdWf1JC.js")
  },
  "d4b21eceb526d8f801cb53277218b45973ec8daf63e13809efbfe42a1143a8a9": {
    functionName: "registerForEvent_createServerFn_handler",
    importer: () => import("./event-pages.functions-BcDjSveu.js")
  },
  "d772e93ca7d8f9707bd37334870d8ee30e8998d906edb62529e2ef277e9b16e5": {
    functionName: "getEbdMonthly_createServerFn_handler",
    importer: () => import("./reports.functions-fOvGFobz.js")
  },
  "d9251c9c8094c3d38d24a7bf28685b4c34dda89aad058492f87927f8bb625494": {
    functionName: "deleteNews_createServerFn_handler",
    importer: () => import("./hub.functions-CjF2fV3O.js")
  },
  "db4061caf5c2ae47f6fddff2e099f60dd6dee13d425050ef65c9dcb0ccbb1154": {
    functionName: "listMyPurchases_createServerFn_handler",
    importer: () => import("./products.functions-BaE9KThl.js")
  },
  "e210c93408e1024b87db0bb69ce6731f58410fc743dca9f3021ad2bae36584c6": {
    functionName: "deleteType_createServerFn_handler",
    importer: () => import("./types.functions-ikdWf1JC.js")
  },
  "e3624534a8e6bdbe76d11b9606a441f4bbf0bd35ed1fd5e67f0a8ac8cd677ace": {
    functionName: "getPublicNews_createServerFn_handler",
    importer: () => import("./hub.functions-CjF2fV3O.js")
  },
  "e4b7436126fe609eb0b8c49acc757ec9f4a2fbd8256afaf3d83d2f7b8b50edf5": {
    functionName: "deleteSystemUpdate_createServerFn_handler",
    importer: () => import("./feedback.functions-BfkAGG1c.js")
  },
  "e5a23320874be81a91206b2972b53c0677757ddab1fe8a51dab375881a4ea6d1": {
    functionName: "listPublicEventsBySite_createServerFn_handler",
    importer: () => import("./event-pages.functions-BcDjSveu.js")
  },
  "e8667fe4ae82af20010a57282b0dda0b4a0eb5420974889f867ec1ba2d6da0ad": {
    functionName: "updateVisitorStatus_createServerFn_handler",
    importer: () => import("./visitors.functions-BtddFAZF.js")
  },
  "e93fd17da7bc0c6a55c490913024dc80c37aab66e3f0ba8297e6477eaaf30139": {
    functionName: "upsertLocation_createServerFn_handler",
    importer: () => import("./locations.functions-CZPBWzWP.js")
  },
  "ea0be6f95eae3c15c134dd79ab6d09364bcb0137854f5a29830b5362471dc0c3": {
    functionName: "getMyMercadoPagoConnection_createServerFn_handler",
    importer: () => import("./mercadopago-connections.functions-Di_kG6ds.js")
  },
  "ea23eec6d66b416a2e273b490a2fb8f07c8eb2a9c1d5d1665d1f060bb377c931": {
    functionName: "deleteEventPage_createServerFn_handler",
    importer: () => import("./event-pages.functions-BcDjSveu.js")
  },
  "ec0044e223e528d03347901e50c43c6e7a054e820cbcdc7c126f309279bd463e": {
    functionName: "disconnectMercadoPago_createServerFn_handler",
    importer: () => import("./mercadopago-connections.functions-Di_kG6ds.js")
  },
  "ed8b645863bbaa87458bf6c7cde61e9312766091e8e4a2ec1d7647143d578de6": {
    functionName: "createHubUploadUrl_createServerFn_handler",
    importer: () => import("./hub.functions-CjF2fV3O.js")
  },
  "ef72a764d07151b7316b4ae331c9166ebe913dab38a63095ca0c4726f0b1d6a9": {
    functionName: "listEbdClasses_createServerFn_handler",
    importer: () => import("./ebd.functions-N_DpzzSj.js")
  },
  "efa320aa986ffda6055cc767266f5037639f55c6e8656b7adda87bd9abdd9523": {
    functionName: "listDocumentTemplates_createServerFn_handler",
    importer: () => import("./documents.functions-jWFzpTM6.js")
  },
  "f43ae3e8e95bc60889280aab911f8b6d73cd1c07ce6099b68d26295c7f87e2c5": {
    functionName: "getPublicDonationCampaign_createServerFn_handler",
    importer: () => import("./donations.functions-CEdg0DMY.js")
  },
  "f560ad215a8e1df17a87a9662632ed838252cad4fd9cb79601479c54e06e6430": {
    functionName: "uploadAccountAsset_createServerFn_handler",
    importer: () => import("./account.functions-C4CPPqGk.js")
  },
  "f586cf011e79c5a8c2f07c0bd19a231ed27fc6f2f5633d074eab036d0e528f51": {
    functionName: "upsertWhatsappSettings_createServerFn_handler",
    importer: () => import("./whatsapp.functions-CwJcT_Vt.js")
  },
  "f5da85c9863c52e1c7998124b2cb7314aec7d4bed4fa6e3acaf98f2a146255c4": {
    functionName: "deletePrayerRequest_createServerFn_handler",
    importer: () => import("./prayer.functions-cOVSQCAz.js")
  },
  "f768ca88e70c2310e647afcadbb91c5a509aa6bb78740c1ad3cf3e8730efb934": {
    functionName: "getPublicVisitorForm_createServerFn_handler",
    importer: () => import("./visitors.functions-BtddFAZF.js")
  },
  "f783d064126a6698039e7eec74f0fcc451e4bfd0e3115f6a3e31192fd1c505a6": {
    functionName: "upsertEvent_createServerFn_handler",
    importer: () => import("./events.functions-Cl-FnDbS.js")
  },
  "f854b6e02559ffb903cab6dfb7f8a578b3a56dfb53eb0495e3d4c06d0afd0a63": {
    functionName: "deleteSmallGroup_createServerFn_handler",
    importer: () => import("./small-groups.functions-ZJqebR_i.js")
  },
  "f8dd72aee13ccb48d3bbce5334d4dc0e89d734ab33bb399313af66107be91370": {
    functionName: "createPixPayment_createServerFn_handler",
    importer: () => import("./billing.functions-DIRX8f30.js")
  },
  "faed6e5154c6e5bacbd9d2e2a831bd865c0ad0284b73f7c9755999360169ae01": {
    functionName: "listLiveStreams_createServerFn_handler",
    importer: () => import("./live-streams.functions-3dfXu21c.js")
  },
  "fbb6aec214bfb13393d699e05a4618af3adb13eaf54267bc2306cad764023ec6": {
    functionName: "getDonations_createServerFn_handler",
    importer: () => import("./_authenticated.finances-Cmzcj-rX.js")
  }
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
  if (!fnModule) {
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    throw new Error("Server function module export not resolved for serverFn ID: " + id);
  }
  return action;
}
var TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
var TSS_SERVER_FUNCTION = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION");
var TSS_SERVER_FUNCTION_FACTORY = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION_FACTORY");
var X_TSS_SERIALIZED = "x-tss-serialized";
var X_TSS_RAW_RESPONSE = "x-tss-raw";
var TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
var FrameType = {
  /** Seroval JSON chunk (NDJSON line) */
  JSON: 0,
  /** Raw stream data chunk */
  CHUNK: 1,
  /** Raw stream end (EOF) */
  END: 2,
  /** Raw stream error */
  ERROR: 3
};
var FRAME_HEADER_SIZE = 9;
var TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=1`;
function isSafeKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function safeObjectMerge(target, source) {
  const result = /* @__PURE__ */ Object.create(null);
  if (target) {
    for (const key of Object.keys(target)) if (isSafeKey(key)) result[key] = target[key];
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) if (isSafeKey(key)) result[key] = source[key];
  }
  return result;
}
function createNullProtoObject(source) {
  if (!source) return /* @__PURE__ */ Object.create(null);
  const obj = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(source)) if (isSafeKey(key)) obj[key] = source[key];
  return obj;
}
var GLOBAL_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:start-storage-context");
var globalObj = globalThis;
if (!globalObj[GLOBAL_STORAGE_KEY]) globalObj[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
var startStorage = globalObj[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn) {
  return startStorage.run(context, fn);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) throw new Error(`No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return context;
}
var getStartOptions = () => getStartContext().startOptions;
var getStartContextServerOnly = getStartContext;
var createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") resolvedOptions.method = "GET";
  const setValidator = (validator) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      validator,
      inputValidator: validator
    });
  };
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.map((m) => {
        if (TSS_SERVER_FUNCTION_FACTORY in m) {
          if (m.options.middleware) newMiddleware.push(...m.options.middleware);
        } else newMiddleware.push(m);
      });
      const res2 = createServerFn(void 0, {
        ...resolvedOptions,
        middleware: newMiddleware
      });
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    validator: setValidator,
    inputValidator: setValidator,
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = {
        ...resolvedOptions,
        extractedFn,
        serverFn
      };
      const resolvedMiddleware = [...newOptions.middleware || [], serverFnBaseToMiddleware(newOptions)];
      extractedFn.method = resolvedOptions.method;
      return Object.assign(async (opts) => {
        const result = await executeMiddleware$1(resolvedMiddleware, "client", {
          ...extractedFn,
          ...newOptions,
          data: opts?.data,
          headers: opts?.headers,
          signal: opts?.signal,
          fetch: opts?.fetch,
          context: createNullProtoObject()
        });
        const redirect = parseRedirect(result.error);
        if (redirect) throw redirect;
        if (result.error) throw result.error;
        return result.result;
      }, {
        ...extractedFn,
        method: resolvedOptions.method,
        __executeServer: async (opts) => {
          const startContext = getStartContextServerOnly();
          const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
          return await executeMiddleware$1(resolvedMiddleware, "server", {
            ...extractedFn,
            ...opts,
            serverFnMeta: extractedFn.serverFnMeta,
            context: safeObjectMerge(opts.context, serverContextAfterGlobalMiddlewares),
            request: startContext.request
          }).then((d) => ({
            result: d.result,
            error: d.error,
            context: d.sendContext
          }));
        }
      });
    }
  };
  const fun = (options2) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      ...options2
    });
  };
  return Object.assign(fun, res);
};
async function executeMiddleware$1(middlewares, env, opts) {
  let flattenedMiddlewares = flattenMiddlewares([...getStartOptions()?.functionMiddleware || [], ...middlewares]);
  if (env === "server") {
    const startContext = getStartContextServerOnly({ throwIfNotFound: false });
    if (startContext?.executedRequestMiddlewares) flattenedMiddlewares = flattenedMiddlewares.filter((m) => !startContext.executedRequestMiddlewares.has(m));
  }
  const callNextMiddleware = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) return ctx;
    try {
      let validator = "validator" in nextMiddleware.options ? nextMiddleware.options.validator : void 0;
      if (!validator && "inputValidator" in nextMiddleware.options) validator = nextMiddleware.options.inputValidator;
      if (validator && env === "server") ctx.data = await execValidator(validator, ctx.data);
      let middlewareFn = void 0;
      if (env === "client") {
        if ("client" in nextMiddleware.options) middlewareFn = nextMiddleware.options.client;
      } else if ("server" in nextMiddleware.options) middlewareFn = nextMiddleware.options.server;
      if (middlewareFn) {
        const userNext = async (userCtx = {}) => {
          const result2 = await callNextMiddleware({
            ...ctx,
            ...userCtx,
            context: safeObjectMerge(ctx.context, userCtx.context),
            sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
            headers: mergeHeaders(ctx.headers, userCtx.headers),
            _callSiteFetch: ctx._callSiteFetch,
            fetch: ctx._callSiteFetch ?? userCtx.fetch ?? ctx.fetch,
            result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
            error: userCtx.error ?? ctx.error
          });
          if (result2.error) throw result2.error;
          return result2;
        };
        const result = await middlewareFn({
          ...ctx,
          next: userNext
        });
        if (isRedirect(result)) return {
          ...ctx,
          error: result
        };
        if (result instanceof Response) return {
          ...ctx,
          result
        };
        if (!result) throw new Error("User middleware returned undefined. You must call next() or return a result in your middlewares.");
        return result;
      }
      return callNextMiddleware(ctx);
    } catch (error) {
      return {
        ...ctx,
        error
      };
    }
  };
  return callNextMiddleware({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || createNullProtoObject(),
    _callSiteFetch: opts.fetch
  });
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware, depth) => {
    if (depth > maxDepth) throw new Error(`Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`);
    middleware.forEach((m) => {
      if (m.options.middleware) recurse(m.options.middleware, depth + 1);
      if (!seen.has(m)) {
        seen.add(m);
        flattened.push(m);
      }
    });
  };
  recurse(middlewares, 0);
  return flattened;
}
async function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = await validator["~standard"].validate(input);
    if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) return validator.parse(input);
  if (typeof validator === "function") return validator(input);
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    "~types": void 0,
    options: {
      inputValidator: options.validator ?? options.inputValidator,
      client: async ({ next, sendContext, fetch: fetch2, ...ctx }) => {
        const payload = {
          ...ctx,
          context: sendContext,
          fetch: fetch2
        };
        return next(await options.extractedFn?.(payload));
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
var createMiddleware = (options, __opts) => {
  const resolvedOptions = {
    type: "request",
    ...__opts || options
  };
  const setValidator = (validator) => {
    return createMiddleware({}, Object.assign(resolvedOptions, {
      validator,
      inputValidator: validator
    }));
  };
  return {
    options: resolvedOptions,
    middleware: (middleware) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { middleware }));
    },
    validator: setValidator,
    inputValidator: setValidator,
    client: (client) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { client }));
    },
    server: (server2) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { server: server2 }));
    }
  };
};
var innerCreateCsrfMiddleware = (opts = {}) => {
  const middleware = createMiddleware().server(async (ctx) => {
    const csrfCtx = ctx;
    if (opts.filter && !await opts.filter(csrfCtx)) return ctx.next();
    if (await isCsrfRequestAllowed(opts, csrfCtx)) return ctx.next();
    return getFailureResponse(opts, csrfCtx);
  });
  return middleware;
};
var createCsrfMiddleware = innerCreateCsrfMiddleware;
async function isCsrfRequestAllowed(opts, ctx) {
  const result = await getCsrfRequestValidationResult(opts, ctx);
  return result === true || result === void 0 && opts.allowRequestsWithoutOriginCheck === true;
}
async function getCsrfRequestValidationResult(opts, ctx) {
  const fetchSite = ctx.request.headers.get("Sec-Fetch-Site");
  if (fetchSite !== null) return matchValue(opts.secFetchSite ?? "same-origin", fetchSite, ctx);
  const origin = ctx.request.headers.get("Origin");
  if (origin !== null) {
    if (opts.origin) return matchValue(opts.origin, origin, ctx);
    return origin === new URL(ctx.request.url).origin;
  }
  const referer = ctx.request.headers.get("Referer");
  if (referer === null || opts.referer === false) return;
  if (typeof opts.referer === "function") return opts.referer(referer, ctx);
  if (opts.origin) {
    const refererOrigin = getOriginFromUrl(referer);
    return refererOrigin !== void 0 && matchValue(opts.origin, refererOrigin, ctx);
  }
  return isRefererSameOrigin(referer, new URL(ctx.request.url).origin);
}
async function matchValue(matcher, value, ctx) {
  if (typeof matcher === "function") return matcher(value, ctx);
  if (Array.isArray(matcher)) return matcher.includes(value);
  return value === matcher;
}
function getOriginFromUrl(url) {
  try {
    return new URL(url).origin;
  } catch {
    return;
  }
}
function isRefererSameOrigin(referer, requestOrigin) {
  if (referer === requestOrigin) return true;
  if (!referer.startsWith(requestOrigin)) return false;
  if (referer.length === requestOrigin.length) return true;
  const code = referer.charCodeAt(requestOrigin.length);
  return code === 47 || code === 63 || code === 35;
}
async function getFailureResponse(opts, ctx) {
  if (typeof opts.failureResponse === "function") return opts.failureResponse(ctx);
  return opts.failureResponse?.clone() ?? new Response("Forbidden", {
    status: 403
  });
}
function getDefaultSerovalPlugins() {
  return [...getStartOptions()?.serializationAdapters?.map(makeSerovalPlugin) ?? [], ...defaultSerovalPlugins];
}
var textEncoder = new TextEncoder();
var EMPTY_PAYLOAD = new Uint8Array(0);
function encodeFrame(type, streamId, payload) {
  const frame = new Uint8Array(FRAME_HEADER_SIZE + payload.length);
  frame[0] = type;
  frame[1] = streamId >>> 24 & 255;
  frame[2] = streamId >>> 16 & 255;
  frame[3] = streamId >>> 8 & 255;
  frame[4] = streamId & 255;
  frame[5] = payload.length >>> 24 & 255;
  frame[6] = payload.length >>> 16 & 255;
  frame[7] = payload.length >>> 8 & 255;
  frame[8] = payload.length & 255;
  frame.set(payload, FRAME_HEADER_SIZE);
  return frame;
}
function encodeJSONFrame(json) {
  return encodeFrame(FrameType.JSON, 0, textEncoder.encode(json));
}
function encodeChunkFrame(streamId, chunk) {
  return encodeFrame(FrameType.CHUNK, streamId, chunk);
}
function encodeEndFrame(streamId) {
  return encodeFrame(FrameType.END, streamId, EMPTY_PAYLOAD);
}
function encodeErrorFrame(streamId, error) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  return encodeFrame(FrameType.ERROR, streamId, textEncoder.encode(message));
}
function createMultiplexedStream(jsonStream, rawStreams, lateStreamSource) {
  let controller;
  let cancelled = false;
  const readers = [];
  const enqueue = (frame) => {
    if (cancelled) return false;
    try {
      controller.enqueue(frame);
      return true;
    } catch {
      return false;
    }
  };
  const errorOutput = (error) => {
    if (cancelled) return;
    cancelled = true;
    try {
      controller.error(error);
    } catch {
    }
    for (const reader of readers) reader.cancel().catch(() => {
    });
  };
  async function pumpRawStream(streamId, stream) {
    const reader = stream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) {
          enqueue(encodeEndFrame(streamId));
          return;
        }
        if (!enqueue(encodeChunkFrame(streamId, value))) return;
      }
    } catch (error) {
      enqueue(encodeErrorFrame(streamId, error));
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpJSON() {
    const reader = jsonStream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) return;
        if (!enqueue(encodeJSONFrame(value))) return;
      }
    } catch (error) {
      errorOutput(error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpLateStreams() {
    if (!lateStreamSource) return [];
    const lateStreamPumps = [];
    const reader = lateStreamSource.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        lateStreamPumps.push(pumpRawStream(value.id, value.stream));
      }
    } finally {
      reader.releaseLock();
    }
    return lateStreamPumps;
  }
  return new ReadableStream({
    async start(ctrl) {
      controller = ctrl;
      const pumps = [pumpJSON()];
      for (const [streamId, stream] of rawStreams) pumps.push(pumpRawStream(streamId, stream));
      if (lateStreamSource) pumps.push(pumpLateStreams());
      try {
        const latePumps = (await Promise.all(pumps)).find(Array.isArray);
        if (latePumps && latePumps.length > 0) await Promise.all(latePumps);
        if (!cancelled) try {
          controller.close();
        } catch {
        }
      } catch {
      }
    },
    cancel() {
      cancelled = true;
      for (const reader of readers) reader.cancel().catch(() => {
      });
      readers.length = 0;
    }
  });
}
var serovalPlugins = void 0;
var FORM_DATA_CONTENT_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
var MAX_PAYLOAD_SIZE = 1e6;
var handleServerAction = async ({ request, context, serverFnId }) => {
  const methodUpper = request.method.toUpperCase();
  const url = new URL(request.url);
  const action = await getServerFnById(serverFnId);
  if (action.method && methodUpper !== action.method) return new Response(`expected ${action.method} method. Got ${methodUpper}`, {
    status: 405,
    headers: { Allow: action.method }
  });
  const isServerFn = request.headers.get("x-tsr-serverFn") === "true";
  if (!serovalPlugins) serovalPlugins = getDefaultSerovalPlugins();
  const contentType = request.headers.get("Content-Type");
  function parsePayload(payload) {
    return fromJSON(payload, { plugins: serovalPlugins });
  }
  return await (async () => {
    try {
      let serializeResult = function(res2) {
        let nonStreamingBody = void 0;
        const alsResponse = getResponse();
        if (res2 !== void 0) {
          const rawStreams = /* @__PURE__ */ new Map();
          let initialPhase = true;
          let lateStreamWriter;
          let lateStreamReadable = void 0;
          const pendingLateStreams = [];
          const plugins = [createRawStreamRPCPlugin((id, stream) => {
            if (initialPhase) {
              rawStreams.set(id, stream);
              return;
            }
            if (lateStreamWriter) {
              lateStreamWriter.write({
                id,
                stream
              }).catch(() => {
              });
              return;
            }
            pendingLateStreams.push({
              id,
              stream
            });
          }), ...serovalPlugins || []];
          let done = false;
          const callbacks = {
            onParse: (value) => {
              nonStreamingBody = value;
            },
            onDone: () => {
              done = true;
            },
            onError: (error) => {
              throw error;
            }
          };
          toCrossJSONStream(res2, {
            refs: /* @__PURE__ */ new Map(),
            plugins,
            onParse(value) {
              callbacks.onParse(value);
            },
            onDone() {
              callbacks.onDone();
            },
            onError: (error) => {
              callbacks.onError(error);
            }
          });
          initialPhase = false;
          if (done && rawStreams.size === 0) return new Response(nonStreamingBody ? JSON.stringify(nonStreamingBody) : void 0, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": "application/json",
              [X_TSS_SERIALIZED]: "true"
            }
          });
          const { readable, writable } = new TransformStream();
          lateStreamReadable = readable;
          lateStreamWriter = writable.getWriter();
          for (const registration of pendingLateStreams) lateStreamWriter.write(registration).catch(() => {
          });
          pendingLateStreams.length = 0;
          const multiplexedStream = createMultiplexedStream(new ReadableStream({
            start(controller) {
              callbacks.onParse = (value) => {
                controller.enqueue(JSON.stringify(value) + "\n");
              };
              callbacks.onDone = () => {
                try {
                  controller.close();
                } catch {
                }
                lateStreamWriter?.close().catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              callbacks.onError = (error) => {
                controller.error(error);
                lateStreamWriter?.abort(error).catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              if (nonStreamingBody !== void 0) callbacks.onParse(nonStreamingBody);
              if (done) callbacks.onDone();
            },
            cancel() {
              lateStreamWriter?.abort().catch(() => {
              });
              lateStreamWriter = void 0;
            }
          }), rawStreams, lateStreamReadable);
          return new Response(multiplexedStream, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": TSS_CONTENT_TYPE_FRAMED_VERSIONED,
              [X_TSS_SERIALIZED]: "true"
            }
          });
        }
        return new Response(void 0, {
          status: alsResponse.status,
          statusText: alsResponse.statusText
        });
      };
      let res = await (async () => {
        if (FORM_DATA_CONTENT_TYPES.some((type) => contentType && contentType.includes(type))) {
          if (methodUpper === "GET") {
            if (false) ;
            invariant();
          }
          const formData = await request.formData();
          const serializedContext = formData.get(TSS_FORMDATA_CONTEXT);
          formData.delete(TSS_FORMDATA_CONTEXT);
          const params = {
            context,
            data: formData,
            method: methodUpper
          };
          if (typeof serializedContext === "string") try {
            const deserializedContext = fromJSON(JSON.parse(serializedContext), { plugins: serovalPlugins });
            if (typeof deserializedContext === "object" && deserializedContext) params.context = safeObjectMerge(deserializedContext, context);
          } catch (e) {
            if (false) ;
          }
          return await action(params);
        }
        if (methodUpper === "GET") {
          const payloadParam = url.searchParams.get("payload");
          if (payloadParam && payloadParam.length > MAX_PAYLOAD_SIZE) throw new Error("Payload too large");
          const payload2 = payloadParam ? parsePayload(JSON.parse(payloadParam)) : {};
          payload2.context = safeObjectMerge(payload2.context, context);
          payload2.method = methodUpper;
          return await action(payload2);
        }
        let jsonPayload;
        if (contentType?.includes("application/json")) jsonPayload = await request.json();
        const payload = jsonPayload ? parsePayload(jsonPayload) : {};
        payload.context = safeObjectMerge(payload.context, context);
        payload.method = methodUpper;
        return await action(payload);
      })();
      const unwrapped = res.result || res.error;
      if (isNotFound(res)) res = isNotFoundResponse(res);
      if (!isServerFn) return unwrapped;
      if (unwrapped instanceof Response) {
        if (isRedirect(unwrapped)) return unwrapped;
        unwrapped.headers.set(X_TSS_RAW_RESPONSE, "true");
        return unwrapped;
      }
      return serializeResult(res);
    } catch (error) {
      if (error instanceof Response) return error;
      if (isNotFound(error)) return isNotFoundResponse(error);
      console.info();
      console.info("Server Fn Error!");
      console.info();
      console.error(error);
      console.info();
      const serializedError = JSON.stringify(await Promise.resolve(toCrossJSONAsync(error, {
        refs: /* @__PURE__ */ new Map(),
        plugins: serovalPlugins
      })));
      const response = getResponse();
      return new Response(serializedError, {
        status: response.status ?? 500,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
          [X_TSS_SERIALIZED]: "true"
        }
      });
    }
  })();
};
function isNotFoundResponse(error) {
  const { headers, ...rest } = error;
  return new Response(JSON.stringify(rest), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...headers || {}
    }
  });
}
var LINK_PARAM_TOKEN_RE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
var PRELOAD_AS_VALUES = /* @__PURE__ */ new Set([
  "fetch",
  "font",
  "image",
  "script",
  "style",
  "track"
]);
function buildLinkParam(name, value) {
  if (value === void 0) return name;
  if (LINK_PARAM_TOKEN_RE.test(value)) return `${name}=${value}`;
  return `${name}=${JSON.stringify(value)}`;
}
function serializeEarlyHint(hint) {
  const parts = [`<${hint.href}>`, buildLinkParam("rel", hint.rel)];
  if (hint.as) parts.push(buildLinkParam("as", hint.as));
  if (hint.crossOrigin !== void 0) parts.push(buildLinkParam("crossorigin", hint.crossOrigin || void 0));
  if (hint.type) parts.push(buildLinkParam("type", hint.type));
  if (hint.integrity) parts.push(buildLinkParam("integrity", hint.integrity));
  if (hint.referrerPolicy) parts.push(buildLinkParam("referrerpolicy", hint.referrerPolicy));
  if (hint.fetchPriority) parts.push(buildLinkParam("fetchpriority", hint.fetchPriority));
  return parts.join("; ");
}
function getStringAttr(attrs, name, fallbackName) {
  const value = attrs?.[name] ?? (fallbackName ? attrs?.[fallbackName] : void 0);
  return typeof value === "string" ? value : void 0;
}
function getPreloadAs(attrs) {
  const as = getStringAttr(attrs, "as");
  return as && PRELOAD_AS_VALUES.has(as) ? as : void 0;
}
function addEarlyHintFetchAttrs(hint, attrs) {
  const crossOrigin = getStringAttr(attrs, "crossOrigin", "crossorigin");
  const type = getStringAttr(attrs, "type");
  const integrity = getStringAttr(attrs, "integrity");
  const referrerPolicy = getStringAttr(attrs, "referrerPolicy", "referrerpolicy");
  const fetchPriority = getStringAttr(attrs, "fetchPriority", "fetchpriority");
  if (crossOrigin !== void 0) hint.crossOrigin = crossOrigin;
  if (type) hint.type = type;
  if (integrity) hint.integrity = integrity;
  if (referrerPolicy) hint.referrerPolicy = referrerPolicy;
  if (fetchPriority) hint.fetchPriority = fetchPriority;
}
function linkAttrsToEarlyHint(attrs) {
  const href = getStringAttr(attrs, "href");
  const rel = getStringAttr(attrs, "rel");
  if (!href || !rel) return void 0;
  const relTokens = rel.split(/\s+/);
  let hintRel;
  let hintAs;
  if (relTokens.includes("modulepreload")) {
    hintRel = "modulepreload";
    hintAs = "script";
  } else if (relTokens.includes("stylesheet")) {
    hintRel = "preload";
    hintAs = "style";
  } else if (relTokens.includes("preload")) {
    hintAs = getPreloadAs(attrs);
    if (!hintAs) return void 0;
    hintRel = "preload";
  } else if (relTokens.includes("preconnect")) {
    hintRel = "preconnect";
    hintAs = void 0;
  } else if (relTokens.includes("dns-prefetch")) {
    hintRel = "dns-prefetch";
    hintAs = void 0;
  }
  if (!hintRel) return void 0;
  const hint = {
    href,
    rel: hintRel
  };
  if (hintAs) hint.as = hintAs;
  addEarlyHintFetchAttrs(hint, attrs);
  return hint;
}
function collectStaticHintsFromManifest(manifest2, matchedRoutes) {
  const hints = [];
  for (const route of matchedRoutes) {
    const routeManifest = manifest2.routes[route.id];
    if (!routeManifest) continue;
    for (const link of routeManifest.preloads ?? []) {
      const attrs = getScriptPreloadAttrs(manifest2, link);
      const hint = {
        href: attrs.href,
        rel: attrs.rel,
        as: "script"
      };
      if (attrs.crossOrigin !== void 0) hint.crossOrigin = attrs.crossOrigin;
      hints.push(hint);
    }
    for (const link of routeManifest.css ?? []) {
      const stylesheetHref = getStylesheetHref(link);
      if (manifest2.inlineCss?.styles[stylesheetHref] !== void 0) continue;
      const resolvedLink = resolveManifestCssLink(link);
      const hint = {
        href: stylesheetHref,
        rel: "preload",
        as: "style"
      };
      if (resolvedLink.crossOrigin !== void 0) hint.crossOrigin = resolvedLink.crossOrigin;
      hints.push(hint);
    }
  }
  return hints;
}
function collectDynamicHintsFromMatches(matches) {
  const hints = [];
  for (const match of matches) {
    const links = match.links;
    if (!Array.isArray(links)) continue;
    for (const link of links) {
      const hint = linkAttrsToEarlyHint(link);
      if (hint) hints.push(hint);
    }
  }
  return hints;
}
function createEarlyHintsEvent(opts) {
  const nextHints = [];
  const nextLinks = [];
  for (const hint of opts.hints) {
    const link = serializeEarlyHint(hint);
    if (opts.sentLinks.has(link)) continue;
    opts.sentLinks.add(link);
    opts.sentHints.push(hint);
    nextHints.push(hint);
    nextLinks.push(link);
  }
  if (!nextHints.length && opts.phase !== "dynamic") return void 0;
  return {
    phase: opts.phase,
    hints: nextHints,
    links: nextLinks,
    allHints: opts.sentHints.slice(),
    allLinks: Array.from(opts.sentLinks)
  };
}
function createResponseLinkHeaderEntries(opts) {
  for (const hint of opts.hints) {
    const link = serializeEarlyHint(hint);
    if (opts.sentLinks.has(link)) continue;
    opts.sentLinks.add(link);
    opts.entries.push({
      phase: opts.phase,
      hint,
      link
    });
  }
}
function getResponseLinkHeaderEntries(opts) {
  if (!opts.filter) return opts.entries.map((entry) => entry.link);
  try {
    const links = [];
    for (const entry of opts.entries) if (opts.filter(entry)) links.push(entry.link);
    return links;
  } catch (err) {
    console.error("Error filtering response Link headers:", err);
    return [];
  }
}
function notifyEarlyHints(phase, event, onEarlyHints) {
  try {
    const result = onEarlyHints(event);
    if (result) Promise.resolve(result).catch((err) => {
      console.error(`Error sending ${phase} early hints:`, err);
    });
  } catch (err) {
    console.error(`Error sending ${phase} early hints:`, err);
  }
}
function getResponseLinkHeaderFilter(responseLinkHeader) {
  if (typeof responseLinkHeader !== "object") return;
  return responseLinkHeader.filter;
}
function appendResponseLinkHeaders(opts) {
  for (const link of getResponseLinkHeaderEntries(opts)) opts.responseHeaders.append("Link", link);
}
function collectResponseLinkHeaderEntries(opts) {
  for (let index = 0; index < opts.event.hints.length; index++) opts.entries.push({
    phase: opts.phase,
    hint: opts.event.hints[index],
    link: opts.event.links[index]
  });
}
function collectEarlyHintsPhase(opts) {
  const event = opts.onEarlyHints ? createEarlyHintsEvent({
    phase: opts.phase,
    hints: opts.hints,
    sentLinks: opts.sentLinks,
    sentHints: opts.sentHints
  }) : void 0;
  if (event) notifyEarlyHints(opts.phase, event, opts.onEarlyHints);
  if (!opts.responseLinkHeaderEntries) return;
  if (event) {
    collectResponseLinkHeaderEntries({
      phase: opts.phase,
      event,
      entries: opts.responseLinkHeaderEntries
    });
    return;
  }
  createResponseLinkHeaderEntries({
    phase: opts.phase,
    hints: opts.hints,
    sentLinks: opts.sentLinks,
    entries: opts.responseLinkHeaderEntries
  });
}
function createEarlyHintsCollector(opts) {
  if (!opts?.onEarlyHints && !opts?.responseLinkHeader) return;
  const sentLinks = /* @__PURE__ */ new Set();
  const sentHints = opts.onEarlyHints ? new Array() : void 0;
  const responseLinkHeaderEntries = opts.responseLinkHeader ? new Array() : void 0;
  const responseLinkHeaderFilter = getResponseLinkHeaderFilter(opts.responseLinkHeader);
  return {
    collectStatic: ({ manifest: manifest2, matchedRoutes }) => {
      if (!matchedRoutes?.length) return;
      collectEarlyHintsPhase({
        phase: "static",
        hints: collectStaticHintsFromManifest(manifest2, matchedRoutes),
        sentLinks,
        sentHints,
        onEarlyHints: opts.onEarlyHints,
        responseLinkHeaderEntries
      });
    },
    collectDynamic: (matches) => {
      collectEarlyHintsPhase({
        phase: "dynamic",
        hints: collectDynamicHintsFromMatches(matches),
        sentLinks,
        sentHints,
        onEarlyHints: opts.onEarlyHints,
        responseLinkHeaderEntries
      });
    },
    appendResponseHeaders: (headers) => {
      if (!responseLinkHeaderEntries?.length) return;
      appendResponseLinkHeaders({
        responseHeaders: headers,
        entries: responseLinkHeaderEntries,
        filter: responseLinkHeaderFilter
      });
    }
  };
}
function normalizeTransformAssetResult(result) {
  if (typeof result === "string") return { href: result };
  return result;
}
function escapeCssString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\a ").replace(/\r/g, "\\d ").replace(/\f/g, "\\c ");
}
async function transformInlineCssTemplate(options) {
  const { strings, urls } = options.template;
  if (strings.length !== urls.length + 1) throw new Error(`TanStack Start inlineCss template for ${options.stylesheetHref} is invalid`);
  let css = strings[0];
  for (let index = 0; index < urls.length; index++) {
    const transformed = normalizeTransformAssetResult(await options.transformFn({
      kind: "css-url",
      url: urls[index],
      stylesheetHref: options.stylesheetHref
    }));
    css += escapeCssString(transformed.href) + strings[index + 1];
  }
  return css;
}
async function transformInlineCssStyles(inlineCss, transformFn) {
  const transformedStyles = {};
  const transformedEntries = await Promise.all(Object.entries(inlineCss.styles).map(async ([stylesheetHref, css]) => {
    const template = inlineCss.templates?.[stylesheetHref];
    return [stylesheetHref, template ? await transformInlineCssTemplate({
      stylesheetHref,
      template,
      transformFn
    }) : css];
  }));
  for (const [stylesheetHref, css] of transformedEntries) transformedStyles[stylesheetHref] = css;
  return {
    styles: transformedStyles,
    ...inlineCss.templates ? { templates: inlineCss.templates } : {}
  };
}
function resolveTransformAssetsCrossOrigin(config, kind) {
  if (!config) return void 0;
  if (typeof config === "string") return config;
  return config[kind];
}
function isObjectShorthand(transform) {
  return "prefix" in transform;
}
function resolveTransformAssetsConfig(transform) {
  if (typeof transform === "string") {
    const prefix = transform;
    return {
      type: "transform",
      transformFn: ({ url }) => ({ href: `${prefix}${url}` }),
      cache: true
    };
  }
  if (typeof transform === "function") return {
    type: "transform",
    transformFn: transform,
    cache: true
  };
  if (isObjectShorthand(transform)) {
    const { prefix, crossOrigin } = transform;
    return {
      type: "transform",
      transformFn: ({ url, kind }) => {
        const href = `${prefix}${url}`;
        if (kind === "css-url") return { href };
        const co = resolveTransformAssetsCrossOrigin(crossOrigin, kind);
        return co ? {
          href,
          crossOrigin: co
        } : { href };
      },
      cache: true
    };
  }
  if ("createTransform" in transform && transform.createTransform) return {
    type: "createTransform",
    createTransform: transform.createTransform,
    cache: transform.cache !== false
  };
  return {
    type: "transform",
    transformFn: typeof transform.transform === "string" ? (({ url }) => ({ href: `${transform.transform}${url}` })) : transform.transform,
    cache: transform.cache !== false
  };
}
function assignManifestLink(link, next) {
  if (typeof link === "string") return next.crossOrigin ? next : next.href;
  const nextLink = {
    ...link,
    href: next.href
  };
  if (next.crossOrigin) nextLink.crossOrigin = next.crossOrigin;
  else delete nextLink.crossOrigin;
  return nextLink;
}
async function transformManifestAssets(source, transformFn, _opts) {
  const manifest2 = structuredClone(source);
  const inlineCssEnabled = _opts?.inlineCss !== false;
  const scriptTransforms = /* @__PURE__ */ new Map();
  const transformScript = (url) => {
    const cached = scriptTransforms.get(url);
    if (cached) return cached;
    const transformed = Promise.resolve(transformFn({
      url,
      kind: "script"
    })).then(normalizeTransformAssetResult);
    scriptTransforms.set(url, transformed);
    return transformed;
  };
  if (!inlineCssEnabled) delete manifest2.inlineCss;
  else if (manifest2.inlineCss) manifest2.inlineCss = await transformInlineCssStyles(manifest2.inlineCss, transformFn);
  for (const route of Object.values(manifest2.routes)) {
    if (route.preloads?.length) route.preloads = await Promise.all(route.preloads.map(async (link) => {
      const result = await transformScript(resolveManifestAssetLink(link).href);
      return assignManifestLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.css?.length && !manifest2.inlineCss) route.css = await Promise.all(route.css.map(async (link) => {
      const result = normalizeTransformAssetResult(await transformFn({
        url: resolveManifestCssLink(link).href,
        kind: "stylesheet"
      }));
      return assignManifestLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.scripts?.length) for (const script of route.scripts) {
      const src = script.attrs?.src;
      if (typeof src !== "string") continue;
      const result = await transformScript(src);
      script.attrs = {
        ...script.attrs,
        src: result.href
      };
      if (result.crossOrigin) script.attrs.crossOrigin = result.crossOrigin;
      else delete script.attrs.crossOrigin;
    }
  }
  return manifest2;
}
function buildManifest(source, opts) {
  return {
    ...source.scriptFormat ? { scriptFormat: source.scriptFormat } : {},
    ...opts?.inlineCss !== false && source.inlineCss ? { inlineCss: structuredClone(source.inlineCss) } : {},
    routes: { ...source.routes }
  };
}
function getStaticHandlerInlineCssDefault(handlerInlineCss) {
  if (typeof handlerInlineCss === "function") return;
  return handlerInlineCss ?? true;
}
async function resolveInlineCssForRequest(opts) {
  if (opts.requestInlineCss !== void 0) return opts.requestInlineCss;
  if (typeof opts.handlerInlineCss === "function") return await opts.handlerInlineCss({ request: opts.request });
  return opts.handlerInlineCss ?? true;
}
function createCachedBaseManifestLoader(loadBaseManifest) {
  let baseManifestPromise;
  return () => {
    if (!baseManifestPromise) baseManifestPromise = loadBaseManifest().catch((error) => {
      baseManifestPromise = void 0;
      throw error;
    });
    return baseManifestPromise;
  };
}
function createFinalManifestTransformResolver(transformAssets, opts) {
  const transformConfig = transformAssets !== void 0 ? resolveTransformAssetsConfig(transformAssets) : void 0;
  const cache = transformConfig ? transformConfig.cache : true;
  const warmup = !!transformAssets && typeof transformAssets === "object" && "warmup" in transformAssets && transformAssets.warmup === true;
  let cachedCreateTransformPromise;
  const clearCachedCreateTransform = () => {
    cachedCreateTransformPromise = void 0;
  };
  return {
    cache,
    warmup,
    clearCachedCreateTransform,
    getTransformFn: async (ctx) => {
      if (!transformConfig) return void 0;
      if (transformConfig.type !== "createTransform") return transformConfig.transformFn;
      if (!cache || false) return transformConfig.createTransform(ctx);
      if (!cachedCreateTransformPromise) cachedCreateTransformPromise = Promise.resolve(transformConfig.createTransform(ctx)).catch((error) => {
        clearCachedCreateTransform();
        throw error;
      });
      return cachedCreateTransformPromise;
    }
  };
}
function createFinalManifestResolver(opts) {
  const finalManifestCache = /* @__PURE__ */ new Map();
  const transformResolver = createFinalManifestTransformResolver(opts.transformAssets);
  const handlerDefaultInlineCss = getStaticHandlerInlineCssDefault(opts.inlineCss);
  const getRequestManifestOptions = async (requestOpts) => {
    const transformFn = await transformResolver.getTransformFn({
      warmup: false,
      request: requestOpts.request
    });
    const inlineCss = await resolveInlineCssForRequest({
      request: requestOpts.request,
      handlerInlineCss: opts.inlineCss,
      requestInlineCss: requestOpts.requestInlineCss
    });
    return {
      getBaseManifest: requestOpts.getBaseManifest,
      transformFn,
      cache: transformResolver.cache,
      inlineCss
    };
  };
  const resolveRequest = async (requestOpts, cache) => {
    return resolveFinalManifest({
      ...await getRequestManifestOptions(requestOpts),
      finalManifestCache: cache
    });
  };
  return {
    warmup: ({ getBaseManifest: getBaseManifest2 }) => warmupFinalManifest({
      enabled: transformResolver.warmup,
      handlerDefaultInlineCss,
      cache: transformResolver.cache,
      finalManifestCache,
      getBaseManifest: getBaseManifest2,
      getTransformFn: () => transformResolver.getTransformFn({ warmup: true }),
      onError: transformResolver.clearCachedCreateTransform
    }),
    resolveCached: (requestOpts) => resolveRequest(requestOpts, finalManifestCache),
    resolveUncached: (requestOpts) => resolveRequest(requestOpts, void 0)
  };
}
function getFinalManifestCacheKey(inlineCss) {
  return inlineCss ? "inline-css" : "linked-css";
}
function cacheFinalManifestPromise(cachedFinalManifestPromises, cacheKey, promise) {
  const cachedFinalManifestPromise = promise.catch((error) => {
    if (cachedFinalManifestPromises.get(cacheKey) === cachedFinalManifestPromise) cachedFinalManifestPromises.delete(cacheKey);
    throw error;
  });
  cachedFinalManifestPromises.set(cacheKey, cachedFinalManifestPromise);
  return cachedFinalManifestPromise;
}
function getOrCreateCachedFinalManifestPromise(cachedFinalManifestPromises, cacheKey, computeFinalManifest) {
  const cachedFinalManifestPromise = cachedFinalManifestPromises.get(cacheKey);
  if (cachedFinalManifestPromise) return cachedFinalManifestPromise;
  return cacheFinalManifestPromise(cachedFinalManifestPromises, cacheKey, Promise.resolve().then(computeFinalManifest));
}
async function buildFinalManifest(opts) {
  return opts.transformFn ? await transformManifestAssets(opts.base, opts.transformFn, { inlineCss: opts.inlineCss }) : buildManifest(opts.base, { inlineCss: opts.inlineCss });
}
async function resolveFinalManifest(opts) {
  const computeFinalManifest = async () => {
    return buildFinalManifest({
      base: await opts.getBaseManifest(),
      transformFn: opts.transformFn,
      inlineCss: opts.inlineCss
    });
  };
  if (opts.finalManifestCache && (!opts.transformFn || opts.cache)) return getOrCreateCachedFinalManifestPromise(opts.finalManifestCache, getFinalManifestCacheKey(opts.inlineCss), computeFinalManifest);
  return computeFinalManifest();
}
function warmupFinalManifest(opts) {
  if (!opts.enabled || opts.handlerDefaultInlineCss === void 0 || !opts.cache) return;
  const inlineCss = opts.handlerDefaultInlineCss;
  const warmupPromise = getOrCreateCachedFinalManifestPromise(opts.finalManifestCache, getFinalManifestCacheKey(inlineCss), async () => {
    const [base, transformFn] = await Promise.all([opts.getBaseManifest(), opts.getTransformFn()]);
    return buildFinalManifest({
      base,
      transformFn,
      inlineCss
    });
  });
  if (opts.onError) warmupPromise.catch(opts.onError);
  return warmupPromise;
}
var ServerFunctionSerializationAdapter = createSerializationAdapter({
  key: "$TSS/serverfn",
  test: (v) => {
    if (typeof v !== "function") return false;
    if (!(TSS_SERVER_FUNCTION in v)) return false;
    return !!v[TSS_SERVER_FUNCTION];
  },
  toSerializable: ({ serverFnMeta }) => ({ functionId: serverFnMeta.id }),
  fromSerializable: ({ functionId }) => {
    const fn = async (opts, signal) => {
      return (await (await getServerFnById(functionId))(opts ?? {}, signal)).result;
    };
    return fn;
  }
});
function getStartResponseHeaders(opts) {
  return mergeHeaders({ "Content-Type": "text/html; charset=utf-8" }, ...opts.router.stores.matches.get().map((match) => {
    return match.headers;
  }));
}
var entriesPromise;
var hasWarnedMissingCsrfMiddleware = false;
var defaultCsrfMiddleware = createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === "serverFn" });
var getCachedBaseManifest = createCachedBaseManifestLoader(() => getStartManifest());
var getProdBaseManifest = () => getCachedBaseManifest();
var getBaseManifest = getProdBaseManifest;
var createEarlyHintsForRequest = createEarlyHintsCollector;
async function loadEntries() {
  const [routerEntry, startEntry, pluginAdapters] = await Promise.all([
    import("./router-BAWvi9U-.js").then((n) => n.Z),
    import("./start-CDonVivE.js"),
    import("./empty-plugin-adapters-BFgPZ6_d.js")
  ]);
  return {
    routerEntry,
    startEntry,
    pluginAdapters
  };
}
function getEntries() {
  if (!entriesPromise) entriesPromise = loadEntries();
  return entriesPromise;
}
function warnMissingCsrfMiddlewareOnce() {
  if (hasWarnedMissingCsrfMiddleware) return;
  hasWarnedMissingCsrfMiddleware = true;
  console.warn(`TanStack Start server functions are not protected by the CSRF middleware.

Server functions are same-origin RPC endpoints and should be protected from cross-site requests.

Add the CSRF middleware in src/start.ts:

  const csrfMiddleware = createCsrfMiddleware({
    filter: (ctx) => ctx.handlerType === 'serverFn',
  })

  export const startInstance = createStart(() => ({
    requestMiddleware: [csrfMiddleware],
  }))

If you intentionally handle CSRF another way, disable this warning:

  tanstackStart({
    serverFns: {
      disableCsrfMiddlewareWarning: true,
    },
  })`);
}
var ROUTER_BASEPATH = "/";
var SERVER_FN_BASE = "/_serverFn/";
var IS_PRERENDERING = process.env.TSS_PRERENDERING === "true";
var IS_SHELL_ENV = process.env.TSS_SHELL === "true";
var ERR_NO_RESPONSE = "Internal Server Error";
var ERR_NO_DEFER = "Internal Server Error";
function throwRouteHandlerError() {
  throw new Error(ERR_NO_RESPONSE);
}
function throwIfMayNotDefer() {
  throw new Error(ERR_NO_DEFER);
}
function isSpecialResponse(value) {
  return value instanceof Response || isRedirect(value);
}
function handleCtxResult(result) {
  if (isSsrResponse(result) || isSpecialResponse(result)) return { response: result };
  return result;
}
async function executeMiddleware(middlewares, ctx) {
  let index = -1;
  let streamResponse;
  const setResponse = (response) => {
    if (isSsrResponse(response)) {
      if (response.serverSsrCleanup === "stream") streamResponse = response;
      ctx.response = response.response;
      return;
    }
    ctx.response = response;
  };
  const disposeStreamResponse = async (reason) => {
    const response = streamResponse;
    if (!response) return;
    streamResponse = void 0;
    const currentResponse = ctx.response;
    if (currentResponse === response.response || currentResponse instanceof Response && response.response.body !== null && currentResponse.body === response.response.body) ctx.response = void 0;
    await response.dispose(reason);
  };
  const getFinalResponse = async () => {
    const response = ctx.response;
    if (!response) throwRouteHandlerError();
    if (!streamResponse) return response;
    if (response === streamResponse.response) return streamResponse;
    if (streamResponse.response.body !== null && response.body === streamResponse.response.body) return {
      ...streamResponse,
      response
    };
    await disposeStreamResponse("middleware response replaced");
    return response;
  };
  const next = async (nextCtx) => {
    if (nextCtx) {
      if (nextCtx.context) ctx.context = safeObjectMerge(ctx.context, nextCtx.context);
      for (const key of Object.keys(nextCtx)) if (key === "response") setResponse(nextCtx.response);
      else if (key !== "context") ctx[key] = nextCtx[key];
    }
    index++;
    const middleware = middlewares[index];
    if (!middleware) return ctx;
    let result;
    try {
      result = await middleware({
        ...ctx,
        next
      });
    } catch (err) {
      if (isSpecialResponse(err)) {
        setResponse(err);
        return ctx;
      }
      await disposeStreamResponse("middleware error");
      throw err;
    }
    const normalized = handleCtxResult(result);
    if (normalized) {
      if (normalized.response !== void 0) setResponse(normalized.response);
      if (normalized.context) ctx.context = safeObjectMerge(ctx.context, normalized.context);
    }
    return ctx;
  };
  await next();
  return {
    ctx,
    response: await getFinalResponse()
  };
}
function handlerToMiddleware(handler, mayDefer = false) {
  if (mayDefer) return handler;
  return async (ctx) => {
    const response = await handler({
      ...ctx,
      next: throwIfMayNotDefer
    });
    if (!response) throwRouteHandlerError();
    return response;
  };
}
function createStartHandler(cbOrOptions) {
  const handlerOptions = typeof cbOrOptions === "function" ? {} : cbOrOptions;
  const cb = typeof cbOrOptions === "function" ? cbOrOptions : cbOrOptions.handler;
  const finalManifestResolver = createFinalManifestResolver({
    ...handlerOptions
  });
  const resolveManifestForRequest = finalManifestResolver.resolveCached;
  finalManifestResolver.warmup({ getBaseManifest: () => getBaseManifest() });
  const startRequestResolver = async (request, requestOpts) => {
    let router = null;
    let responseOwnsCleanup = false;
    try {
      const { url, handledProtocolRelativeURL } = getNormalizedURL(request.url);
      const href = url.pathname + url.search + url.hash;
      const origin = getOrigin(request);
      if (handledProtocolRelativeURL) return Response.redirect(url, 308);
      const entries = await getEntries();
      const hasStartInstance = !!entries.startEntry.startInstance;
      const startOptions = await entries.startEntry.startInstance?.getOptions() || {};
      const { hasPluginAdapters, pluginSerializationAdapters } = entries.pluginAdapters;
      const serializationAdapters = [
        ...startOptions.serializationAdapters || [],
        ...hasPluginAdapters ? pluginSerializationAdapters : [],
        ServerFunctionSerializationAdapter
      ];
      const requestStartOptions = {
        ...startOptions,
        requestMiddleware: hasStartInstance ? startOptions.requestMiddleware : [defaultCsrfMiddleware],
        serializationAdapters
      };
      const flattenedRequestMiddlewares = requestStartOptions.requestMiddleware ? flattenMiddlewares(requestStartOptions.requestMiddleware) : [];
      const executedRequestMiddlewares = new Set(flattenedRequestMiddlewares);
      const getRouter = async () => {
        if (router) return router;
        router = await entries.routerEntry.getRouter();
        let isShell = IS_SHELL_ENV;
        if (IS_PRERENDERING && !isShell) isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
        const history = createMemoryHistory({ initialEntries: [href] });
        router.update({
          history,
          isShell,
          isPrerendering: IS_PRERENDERING,
          origin: router.options.origin ?? origin,
          defaultSsr: requestStartOptions.defaultSsr,
          serializationAdapters: [...requestStartOptions.serializationAdapters, ...router.options.serializationAdapters || []],
          basepath: ROUTER_BASEPATH
        });
        return router;
      };
      if (SERVER_FN_BASE && url.pathname.startsWith(SERVER_FN_BASE)) {
        if (false) ;
        const serverFnId = url.pathname.slice(SERVER_FN_BASE.length).split("/")[0];
        if (!serverFnId) throw new Error("Invalid server action param for serverFnId");
        const serverFnHandler = async ({ context }) => {
          return runWithStartContext({
            getRouter,
            startOptions: requestStartOptions,
            contextAfterGlobalMiddlewares: context,
            request,
            executedRequestMiddlewares,
            handlerType: "serverFn"
          }, () => handleServerAction({
            request,
            context: requestOpts?.context,
            serverFnId
          }));
        };
        const { response: middlewareResponse2 } = await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), serverFnHandler], {
          request,
          pathname: url.pathname,
          handlerType: "serverFn",
          context: createNullProtoObject(requestOpts?.context)
        });
        const result = await handleRedirectResponse(middlewareResponse2, request, getRouter);
        responseOwnsCleanup = result.serverSsrCleanup === "stream";
        return result.response;
      }
      const executeRouter = async (serverContext, matchedRoutes) => {
        const acceptParts = (request.headers.get("Accept") || "*/*").split(",");
        if (!["*/*", "text/html"].some((mimeType) => acceptParts.some((part) => part.trim().startsWith(mimeType)))) return normalizeSsrResponse(Response.json({ error: "Only HTML requests are supported here" }, { status: 500 }));
        const manifest2 = await resolveManifestForRequest({
          request,
          requestInlineCss: requestOpts?.inlineCss,
          getBaseManifest: () => getBaseManifest(matchedRoutes)
        });
        const earlyHints = createEarlyHintsForRequest({
          onEarlyHints: requestOpts?.onEarlyHints,
          responseLinkHeader: requestOpts?.responseLinkHeader
        });
        earlyHints?.collectStatic({
          manifest: manifest2,
          matchedRoutes
        });
        const routerInstance = await getRouter();
        attachRouterServerSsrUtils({
          router: routerInstance,
          manifest: manifest2,
          getRequestAssets: () => getStartContext({ throwIfNotFound: false })?.requestAssets
        });
        routerInstance.update({ additionalContext: { serverContext } });
        await routerInstance.load();
        if (routerInstance.state.redirect) return normalizeSsrResponse(routerInstance.state.redirect);
        earlyHints?.collectDynamic(routerInstance.stores.matches.get());
        const ctx = getStartContext({ throwIfNotFound: false });
        await routerInstance.serverSsr.dehydrate({ requestAssets: ctx?.requestAssets });
        const responseHeaders = getStartResponseHeaders({ router: routerInstance });
        earlyHints?.appendResponseHeaders(responseHeaders);
        return normalizeSsrResponse(await cb({
          request,
          router: routerInstance,
          responseHeaders
        }));
      };
      const requestHandlerMiddleware = async ({ context }) => {
        return runWithStartContext({
          getRouter,
          startOptions: requestStartOptions,
          contextAfterGlobalMiddlewares: context,
          request,
          executedRequestMiddlewares,
          handlerType: "router"
        }, async () => {
          try {
            return await handleServerRoutes({
              getRouter,
              request,
              url,
              executeRouter,
              context,
              executedRequestMiddlewares
            });
          } catch (err) {
            if (err instanceof Response) return err;
            throw err;
          }
        });
      };
      const { response: middlewareResponse } = await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), requestHandlerMiddleware], {
        request,
        pathname: url.pathname,
        handlerType: "router",
        context: createNullProtoObject(requestOpts?.context)
      });
      const response = await handleRedirectResponse(middlewareResponse, request, getRouter);
      responseOwnsCleanup = response.serverSsrCleanup === "stream";
      return response.response;
    } finally {
      if (router?.serverSsr && !responseOwnsCleanup) router.serverSsr.cleanup();
      router = null;
    }
  };
  return requestHandler(startRequestResolver);
}
async function handleRedirectResponse(response, request, getRouter) {
  const ssrResponse = normalizeSsrResponse(response);
  if (!isRedirect(ssrResponse.response)) return ssrResponse;
  if (isResolvedRedirect(ssrResponse.response)) {
    if (request.headers.get("x-tsr-serverFn") === "true") return replaceSsrResponse(ssrResponse, Response.json({
      ...ssrResponse.response.options,
      isSerializedRedirect: true
    }, { headers: ssrResponse.response.headers }), "redirect response replaced");
    return ssrResponse;
  }
  const opts = ssrResponse.response.options;
  if (opts.to && typeof opts.to === "string" && !opts.to.startsWith("/")) throw new Error(`Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(opts)}`);
  if ([
    "params",
    "search",
    "hash"
  ].some((d) => typeof opts[d] === "function")) throw new Error(`Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(opts).filter((d) => typeof opts[d] === "function").map((d) => `"${d}"`).join(", ")}`);
  const redirect = (await getRouter()).resolveRedirect(ssrResponse.response);
  if (request.headers.get("x-tsr-serverFn") === "true") return replaceSsrResponse(ssrResponse, Response.json({
    ...ssrResponse.response.options,
    isSerializedRedirect: true
  }, { headers: ssrResponse.response.headers }), "redirect response replaced");
  return replaceSsrResponse(ssrResponse, redirect, "redirect response replaced");
}
async function handleServerRoutes({ getRouter, request, url, executeRouter, context, executedRequestMiddlewares }) {
  const router = await getRouter();
  const pathname = executeRewriteInput(router.rewrite, url).pathname;
  const { matchedRoutes, foundRoute, routeParams } = router.getMatchedRoutes(pathname);
  const isExactMatch = foundRoute && routeParams["**"] === void 0;
  const routeMiddlewares = [];
  for (const route of matchedRoutes) {
    const serverMiddleware = route.options.server?.middleware;
    if (serverMiddleware) {
      const flattened = flattenMiddlewares(serverMiddleware);
      for (const m of flattened) if (!executedRequestMiddlewares.has(m)) routeMiddlewares.push(m.options.server);
    }
  }
  const server2 = foundRoute?.options.server;
  let isHeadFallback = false;
  if (server2?.handlers && isExactMatch) {
    const handlers = typeof server2.handlers === "function" ? server2.handlers({ createHandlers: (d) => d }) : server2.handlers;
    const requestMethod = request.method.toUpperCase();
    const handler = requestMethod === "HEAD" ? handlers["HEAD"] ?? handlers["GET"] ?? handlers["ANY"] : handlers[requestMethod] ?? handlers["ANY"];
    isHeadFallback = requestMethod === "HEAD" && handler !== void 0 && !handlers["HEAD"];
    if (handler) {
      const mayDefer = !!foundRoute.options.component;
      if (typeof handler === "function") routeMiddlewares.push(handlerToMiddleware(handler, mayDefer));
      else {
        if (handler.middleware?.length) {
          const handlerMiddlewares = flattenMiddlewares(handler.middleware);
          for (const m of handlerMiddlewares) routeMiddlewares.push(m.options.server);
        }
        if (handler.handler) routeMiddlewares.push(handlerToMiddleware(handler.handler, mayDefer));
      }
    }
  }
  routeMiddlewares.push(((ctx2) => executeRouter(ctx2.context, matchedRoutes)));
  const { ctx, response } = await executeMiddleware(routeMiddlewares, {
    request,
    context,
    params: routeParams,
    pathname,
    handlerType: "router"
  });
  if (isHeadFallback) {
    if (!ctx.response) throwRouteHandlerError();
    return stripSsrResponseBody(await handleRedirectResponse(response, request, getRouter), "HEAD body stripped");
  }
  return normalizeSsrResponse(response);
}
var fetch = createStartHandler(defaultStreamHandler);
function createServerEntry(entry) {
  return { async fetch(...args) {
    return await entry.fetch(...args);
  } };
}
var server_default = createServerEntry({ fetch });
const server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createServerEntry,
  default: server_default
}, Symbol.toStringTag, { value: "Module" }));
export {
  HEADERS as H,
  StartServer as S,
  TSS_SERVER_FUNCTION as T,
  getRequestHost as a,
  getResponse as b,
  createStartHandler as c,
  defaultStreamHandler as d,
  createServerFn as e,
  createMiddleware as f,
  getRequest as g,
  getServerFnById as h,
  server as i,
  requestHandler as r,
  setResponseHeaders as s
};
