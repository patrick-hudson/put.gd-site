# Custom uploader

Send your uploads to your own server, or to any service that gives you a ShareX custom uploader file (`.sxcu`). It is tested with Zipline, Chibisafe and XBackBone. By the end of this page you will have imported that file and tested an upload.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/custom-light.avif 1368w, /_site/shots/custom-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/custom-dark.avif 1368w, /_site/shots/custom-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/custom-light.webp 1368w, /_site/shots/custom-light@2x.webp 2736w">
  <img src="/_site/shots/custom-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/custom-dark.webp 1368w, /_site/shots/custom-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The Destinations page with a custom uploader: Import .sxcu, Method, Request URL, Body, File form name and a secret Authorization header.">
</picture>

!!! note "In nightly builds for now"
    The custom uploader arrives in the next stable release. See [stable or nightly](index.md#stable-or-nightly).

1. In **Destinations**, click **Add destination** and choose **Custom uploader (HTTP)**.
2. Click **Import .sxcu…** and choose the file your service gave you, or paste its text. The form fills in from it.
3. Scroll to **Credentials** and choose **Credential storage**, then click **Save to keychain** or **Use for this session**.
4. Click **Test upload and link**.

Until you do step 3, the file's token exists only in this window.

## Fill the form by hand

Without a file, describe the request your server expects.

| Field | What to enter |
| --- | --- |
| **Method** | `POST`, `PUT`, `PATCH` or `GET` |
| **Request URL** | Where uploads are sent. `{filename}` may fill part of the path |
| **Body** | How the file travels: **Form data (multipart)**, the file's bytes, form fields, JSON, XML or nothing |
| **File form name** | The form field that carries the file, often `file` |
| **Headers**, **URL parameters**, **Form fields** | Anything else the server needs, such as an `Authorization` header |
| **URL** | Where the reply holds your link, such as `{json:url}`. Left empty, the whole reply is the link |
| **Deletion URL** | Where the reply holds an address that deletes the file. Optional |
| **Error message** | What to show from the reply when the server refuses an upload. Optional |

In the request, `{filename}` stands for the file's name and `{input}` for text being uploaded. To read the reply, use `{json:path}`, `{xml:path}`, `{regex:pattern}`, `{header:name}` or `{response}`.

## Your token stays secret

Every header, parameter and field value is secret unless you clear **Secret** on its row. Secret values go to your keychain or stay in memory for the session. They never enter the configuration file, History, logs or a diagnostics package.

Clear **Secret** only for ordinary values, such as a folder or format name.

## Plain HTTP

An `http://` address works without asking only for a server on this computer. For any other, turn on **Allow plain HTTP for this destination**, which appears beside the address. Plain HTTP sends your file and token unencrypted.

## What the test does

**Test upload and link** uploads a small made-up file, opens the link that comes back, and deletes the file again if the reply gave a deletion URL. If it gave none, the result says the test file stays on your server.

## Good to know

- **Lost replies.** Your server names each file, so put.gd can't check whether an upload arrived. If the reply is lost, [History](history.md) shows **Upload outcome unknown**. **Retry upload** sends the file again and can leave a second copy on the server.
- **Deleting.** **Delete from destination…** works only for uploads whose reply gave a deletion URL. Zipline and Chibisafe give none, so delete those files on the server.
- **Not supported.** Uploader files that ask a question during the upload, and URL shorteners. The import says so.
