# Gallery filters

For each new or edited photo, select its year and occasion in Admin ? Gallery. The public gallery then filters by those fields. Older photos without tags remain visible under the all-years and all-occasions filters; edit them to make them appear in specific filters.

## Admin image uploads

Admin image uploads use the existing Cloudinary cloud and unsigned preset configured in `firebase-config.js`. The 10 MB limit is enforced in the browser. Firebase Storage rules are not used by the current image upload flow.
