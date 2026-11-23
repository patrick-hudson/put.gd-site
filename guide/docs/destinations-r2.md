# Cloudflare R2

Connect an R2 bucket so that put.gd uploads to it and gives you a link for each file. You will create the bucket and an API token in Cloudflare, then paste them into put.gd.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/r2-light.avif 1368w, /_site/shots/r2-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/r2-dark.avif 1368w, /_site/shots/r2-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/r2-light.webp 1368w, /_site/shots/r2-light@2x.webp 2736w">
  <img src="/_site/shots/r2-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/r2-dark.webp 1368w, /_site/shots/r2-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with a new Cloudflare R2 destination: Account ID, Jurisdiction, Bucket, Folder in bucket, who can open files and the access key fields.">
</picture>

!!! note "In nightly builds for now"
    Cloudflare R2 as its own destination arrives in the next stable release. On the stable release, use [Amazon S3 and compatible](destinations-s3.md#s3-compatible-services). See [stable or nightly](index.md#stable-or-nightly).

## In the Cloudflare dashboard

1. Under **R2 Object Storage**, create the bucket. Its name needs 3 to 63 lowercase letters, digits and hyphens.
2. Under **R2 → Manage API tokens**, create a token with **Object Read & Write**, limited to that bucket.
3. Keep its **Access Key ID** and **Secret Access Key** for put.gd.

## In put.gd

1. In **Destinations**, click **Add destination** and choose **Cloudflare R2**.
2. Paste the bucket's **S3 API** address from its settings page into **Account ID**, such as `https://ACCOUNT.r2.cloudflarestorage.com/my-bucket`. This fills **Account ID**, **Jurisdiction** and **Bucket** at once.
3. Enter a **Folder in bucket** if you want one. Left empty, files go to the top of the bucket.
4. Choose who can open files. See [Links](#links).
5. Enter the **Access key ID** and **Secret access key**, then click **Save to keychain** or **Use for this session**.
6. Click **Test upload and link**. It uploads a small made-up file, checks its link and removes it.

You can also type the three fields yourself. The **Account ID** is on **R2 overview → Account details**, and **Jurisdiction** is **Default**, **EU** or **FedRAMP**. There is no region to choose.

The three fields save together, once all three are valid. Until then, the field to fix says why.

## Links

- **Private bucket: links that expire** is the default. Each link works for 1 to 7 days. Copy it again from History after it expires, and you get a fresh one without uploading again. A link also stops early if its API token is revoked.
- **Public bucket: links that never expire** needs the bucket's public address in **Link domain**. In the bucket's **Settings** in Cloudflare, turn on its **Public Development URL** or connect a custom domain, then paste that address, such as `https://pub-….r2.dev`. Without it, put.gd refuses to upload and says why.

put.gd never changes the bucket's own access settings.

## Already using R2 through the S3 destination?

It keeps working. When its endpoint is an R2 address, the destination offers **Move to Cloudflare R2**. That keeps its name, its keys, your default and your exceptions, and changes nothing until you click it. Uploads already in History stay as they are.

## Good to know

- The token limited to one bucket covers everything put.gd does: uploads, the test, deleting from History and renewing links.
- R2 keeps no older versions, so deleting from History removes the file for good. put.gd checks it is still the file it uploaded first.
