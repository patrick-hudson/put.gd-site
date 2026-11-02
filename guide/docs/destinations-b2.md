# Backblaze B2

Connect a Backblaze bucket so that put.gd uploads to it and gives you a link for each file. You will create the bucket and a key in Backblaze, then enter them in put.gd.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.avif 1368w, /_site/shots/storage-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.avif 1368w, /_site/shots/storage-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.webp 1368w, /_site/shots/storage-light@2x.webp 2736w">
  <img src="/_site/shots/storage-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.webp 1368w, /_site/shots/storage-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with an S3 bucket and its link domain.">
</picture>

The picture shows an S3 destination. A Backblaze B2 destination has the same sections with its own fields.

## In the Backblaze console

1. Create the bucket. Its name needs 6 to 63 letters, digits or hyphens, and can't start with `b2-`.
    - Make it **public** for links that never expire. Backblaze allows this only once your account has payment history.
    - Leave it **private** for links that expire.
2. Create an **application key** for that bucket with these capabilities: `listBuckets`, `listFiles`, `readFiles`, `writeFiles` and `deleteFiles`. For a private bucket, add `shareFiles`.

!!! tip "Use a key for just this bucket"
    Your account's master key also works, but it can do everything on the account.

## In put.gd

1. In **Destinations**, click **Add destination** and choose **Backblaze B2**.
2. Enter the **Bucket**, and a **Folder in bucket** if you want one.
3. Under **Links**, set **Who can open files** to match your bucket:
    - **Public bucket: links that never expire**
    - **Private bucket: links that expire**, then choose how long in **Links last**, from 1 to 7 days.
4. For a public bucket, enter a **Link domain** if you have one.
5. Under **Credentials**, enter the **Application key ID** and **Application key**.
6. Choose **Credential storage**, then click **Save to keychain** or **Use for this session**.
7. Click **Test upload and link**.

**System keychain** saves the key for next time. **This session only** keeps it until put.gd closes. The steps for [unlocking saved credentials](destinations-s3.md#unlocking-saved-credentials) are the same as for S3.

## What the test does

The test checks your key and tells you if a capability is missing or the key is limited to another bucket. It then uploads a small made-up text file, opens it through the same kind of link you will get, removes that file, and starts and cancels a large upload.

If you chose public links for a private bucket, the test fails and says what to change.

## What your links look like

- **Public bucket:** `https://fNNN.backblazeb2.com/file/<bucket>/<name>`, or your link domain followed by the file name. These never expire.
- **Private bucket:** the same address with a token on the end. Without the token, Backblaze refuses the file.

When a private link expires, the file stays in the bucket until you delete it from [History](history.md). You can't refresh an expired link yet.

## Good to know

- Backblaze has to be set up as its own destination. The S3 form can't upload to it.
- put.gd never uploads over a file you can see. When a name exists, choose **Add a unique suffix** or **Skip duplicate names** in **Settings → Capture**. **Replace the checked object** isn't available on Backblaze.
- A file can be up to 10 TB.
