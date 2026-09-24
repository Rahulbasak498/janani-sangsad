const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

async function sendToSubscribers(title, body) {
    const subscriptionSnapshot = await db.collection('notificationSubscriptions').get();
    const byToken = new Map();
    subscriptionSnapshot.docs.forEach(doc => {
      const token = doc.data().token;
      if (typeof token === 'string' && token.length > 100) {
        const ids = byToken.get(token) || [];
        ids.push(doc.id);
        byToken.set(token, ids);
      }
    });

    const entries = [...byToken.entries()];
    for (let offset = 0; offset < entries.length; offset += 500) {
      const chunk = entries.slice(offset, offset + 500);
      const response = await messaging.sendEachForMulticast({
        tokens: chunk.map(([token]) => token),
        data: {
          title: String(title || 'জননী সংসদ').slice(0, 100),
          body: String(body || 'নতুন গুরুত্বপূর্ণ ঘোষণা এসেছে।').slice(0, 300),
          url: 'notice.html'
        },
        webpush: { headers: { Urgency: 'high' } }
      });

      const staleDeletes = [];
      response.responses.forEach((result, index) => {
        if (!result.success && [
          'messaging/invalid-registration-token',
          'messaging/registration-token-not-registered'
        ].includes(result.error && result.error.code)) {
          chunk[index][1].forEach(id => staleDeletes.push(db.collection('notificationSubscriptions').doc(id).delete()));
        }
      });
      await Promise.all(staleDeletes);
    }
}

function shouldNotify(data) {
  return data && (data.notifySubscribers === true || data.notifySubscribers === 'true');
}

exports.notifySubscribersOfNotice = functions.firestore
  .document('notices/{noticeId}')
  .onCreate(async snapshot => {
    const notice = snapshot.data() || {};
    if (!shouldNotify(notice)) return null;
    return sendToSubscribers(notice.title || 'জননী সংসদ — নতুন ঘোষণা', notice.desc);
  });

exports.notifySubscribersOfSchedule = functions.firestore
  .document('schedule/{scheduleId}')
  .onWrite(async change => {
    if (!change.after.exists) return null;
    const schedule = change.after.data() || {};
    if (!shouldNotify(schedule)) return null;
    const previous = change.before.exists ? change.before.data() : null;
    const fields = data => JSON.stringify([data.notifySubscribers, data.day, data.date, data.title, data.items]);
    if (previous && fields(previous) === fields(schedule)) return null;
    const title = [schedule.day, schedule.title].filter(Boolean).join(' — ') || 'পূজার সময়সূচি আপডেট';
    const body = [schedule.date, Array.isArray(schedule.items) ? schedule.items.join(' • ') : '']
      .filter(Boolean).join(' · ');
    return sendToSubscribers(title, body);
  });
