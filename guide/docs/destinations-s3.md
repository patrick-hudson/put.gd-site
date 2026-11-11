# Amazon S3 and compatible storage

Connect your own bucket so that put.gd uploads to it and gives you a link for each file. You need a bucket and an access key before you start.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.avif 1368w, /_site/shots/storage-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.avif 1368w, /_site/shots/storage-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-light.webp 1368w, /_site/shots/storage-light@2x.webp 2736w">
  <img src="/_site/shots/storage-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/storage-dark.webp 1368w, /_site/shots/storage-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with an S3 bucket: S3 service, bucket, region, folder, upload access request, who can open files and link domain.">
</picture>

1. In **Destinations**, click **Add destination** and choose **Amazon S3 / S3-compatible**.
2. Under **Where files go**, choose the **S3 service**.
3. Enter the **Bucket**: only its name, without a URL or folder path.
4. Choose the **Region**. You can also type one that isn't listed.
5. Enter a **Folder in bucket** if you want one. Left empty, files go to the bucket root.
6. Under **Links**, choose an **Upload access request** and **Who can open files**, and enter a **Link domain** if you have one.
7. Scroll to **Credentials** and enter your **Access key ID** and **Secret access key**. Fill in **Session token** only if your key came with one.
8. Choose **Credential storage**, then click **Save to keychain** or **Use for this session**.
9. Click **Test upload and link**.

## Links

**Who can open files** decides what kind of link you get:

- **Public bucket: links that never expire** is the default. Anyone can open the file at its address for as long as it exists.
- **Private bucket: links that expire** signs each link so that it works for a limited time. Choose how long in **Links last**, from 1 to 7 days. The bucket stays private, and the link opens the file for anyone who has it until then.

For a public bucket, two more rows apply:

- **Upload access request** is **Use bucket policy** (the default), which sends no ACL so that your bucket's policy decides who can open files, or **Request public read**, which asks S3 to make each new file public. The bucket must then have ACLs turned on.
- **Link domain** is the start of each link, such as `https://demo.put.gd`, with an example shown below the field. Left empty, links use the destination's own address.

Links that expire always use the bucket's own address, and never ask for a public ACL. Temporary credentials can end a link sooner than the time you chose. When a link expires the file stays in your bucket, and you can [renew the link from History](history.md#when-a-link-expires).

None of these settings changes your bucket's policy or your domain's settings, so test the resulting link.

!!! note "In nightly builds for now"
    Links that expire arrive in the next stable release. See [stable or nightly](index.md#stable-or-nightly).

## Credentials

- **System keychain** saves the key in your desktop's keychain for next time.
- **This session only** keeps it in memory until put.gd closes.

Keys never enter settings or history.

## What the test does

**Test upload and link** runs only when you click it, and it uses a small made-up text file.

Success means the test file uploaded, opened through the kind of link you chose, and was removed again. With links that expire, the test also checks that the file can't be opened without its link. If a step fails, the message says what to check next.

## Minimum bucket permissions

- `s3:GetObject`
- `s3:PutObject`
- `s3:ListBucket`, recommended. Without it, a missing file can look the same as a refused one.
- `s3:PutObjectAcl`, only with **Request public read**.

The test and deleting from History use `s3:DeleteObject` and `s3:GetBucketVersioning`, plus `s3:GetObjectVersion` and `s3:DeleteObjectVersion` on versioned files. Large files also use `s3:AbortMultipartUpload` and `s3:ListMultipartUploadParts`. The test tells you which of these two S3 refused.

## S3-compatible services

Set **S3 service** to **Cloudflare R2** or **Other S3-compatible**, then open **Advanced connection settings**:

- **Use a custom endpoint** lets you enter your service's address.
- **Addressing** is **Automatic**, **Bucket in hostname** or **Bucket in URL path**. Bucket names with dots can't use the hostname.
- **Storage class** applies to new uploads. Classes can differ in cost and access.

The service must support conditional writes, which stop an upload replacing another file. The test tells you if it doesn't.

For Cloudflare R2, use the endpoint `https://<account-id>.r2.cloudflarestorage.com`, the region `auto`, **Use bucket policy**, and your r2.dev or custom domain as the **Link domain**. For Backblaze, use the [Backblaze B2](destinations-b2.md) destination instead.

## Unlocking saved credentials

put.gd reads saved keys once when it starts. If your keyring is locked, your desktop asks you to unlock it then. To stop that, turn off **Unlock saved credentials when put.gd starts** in **Settings → General**.

If the keys aren't loaded, click **Unlock saved credentials** on the destination. Uploads and shortcuts never unlock the keyring themselves.

**Current key** shows only the first four characters of a saved access key ID. **Show** reveals the saved secret key after unlocking, and **Hide** clears it from the form.
