# Command line

`putgd-cli` lets your scripts do what the tray does. By the end of this page you will have started a capture from a terminal and read the reply. What you start here appears in History like any other capture.

<picture class="shot">
  <source media="(prefers-color-scheme: light)" type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-light.avif 1368w, /_site/shots/history-light@2x.avif 2736w">
  <source type="image/avif" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-dark.avif 1368w, /_site/shots/history-dark@2x.avif 2736w">
  <source media="(prefers-color-scheme: light)" type="image/webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-light.webp 1368w, /_site/shots/history-light@2x.webp 2736w">
  <img src="/_site/shots/history-dark.webp" sizes="(max-width: 760px) calc(100vw - 32px), 720px" srcset="/_site/shots/history-dark.webp 1368w, /_site/shots/history-dark@2x.webp 2736w" width="1368" height="928" loading="lazy" alt="The History window, where captures and uploads started from a terminal appear with their links.">
</picture>

1. Start put.gd in your desktop session. `putgd-cli` talks to the running app and never starts it.
2. Check what your desktop supports:

    ```bash
    putgd-cli capabilities
    ```

3. Start a region capture:

    ```bash
    putgd-cli action.invoke '{"action":"region"}'
    ```

4. Copy the `operationId` from the reply and follow it:

    ```bash
    putgd-cli operation.inspect '{"id":"RETURNED-ID"}'
    ```

## Where it is

The packages install `putgd-cli` on your path. The AppImage carries it inside, so extract it first:

```bash
./putgd-*.AppImage --appimage-extract
squashfs-root/usr/bin/putgd-cli capabilities
```

## Capture, record and upload the clipboard

`action` can be `region`, `window`, `monitor`, `desktop`, `repeat`, `clipboard`, `edit` or `record`.

```bash
putgd-cli action.invoke '{"action":"clipboard"}'
putgd-cli action.invoke '{"action":"record","mode":"toggle"}'
```

`monitor` captures the monitor the pointer is on, and `repeat` captures your last region again. The screen captures also take `delaySeconds` of 3, 5 or 10. The reply still comes at once, and `operation.cancel` stops the countdown:

```bash
putgd-cli action.invoke '{"action":"window","delaySeconds":5}'
```

## Upload files and folders

Give absolute paths. Both commands upload right away to your capture destination, or your only destination. Folders follow **Settings → General → File manager → Folders**, which makes one `.zip` by default.

`upload.files` needs put.gd running and replies with an `operationId` to follow:

```bash
putgd-cli upload.files '{"paths":["/home/you/photo.png","/home/you/folder"]}'
```

Add `profileId` to pick another destination. If any path is refused, nothing uploads and the reply names it.

`putgd --upload` is what the [file manager entry](file-manager.md) runs. It starts put.gd if needed, reports problems in a notification, and exits once put.gd has its own copy of the files:

```bash
putgd --upload -- /home/you/photo.png /home/you/folder
```

With the AppImage, run `./putgd-*.AppImage --upload -- PATHS`.

## Edit an image first

Give a PNG or JPEG's full path, then submit using the `operationId` from the reply:

```bash
putgd-cli action.invoke '{"action":"edit","source":"file","path":"/home/you/photo.png"}'
putgd-cli editor.submit '{"id":"RETURNED-ID"}'
```

## List and copy results

```bash
putgd-cli operation.recent
putgd-cli history.list '{"limit":5,"category":"images"}'
```

Copying never uploads again. Use an operation's ID, or an item's ID from `history.list`:

```bash
putgd-cli operation.copy '{"id":"RETURNED-ID"}'
putgd-cli history.copyLink '{"id":"HISTORY-ID"}'
```

## Read and change settings

```bash
putgd-cli settings.get
```

The settings are in `result.document`. To change one, pass `result.metadata.observedRevision` as `expectedRevision`, then read the settings again:

```bash
putgd-cli settings.patch '{"patch":{"retention":{"recentActivityLimit":77}},"expectedRevision":"RETURNED-OBSERVED-REVISION"}'
```

Enter access keys in [Destinations](destinations.md); the command line refuses them.

## Add a custom uploader

Import a ShareX `.sxcu` file as a [custom uploader](destinations-custom.md) destination. Pass the revision as for `settings.patch`. The reply lists the names of the values it stored in your keychain, never the values:

```bash
putgd-cli settings.importUploader '{"path":"/home/you/uploader.sxcu","expectedRevision":"RETURNED-OBSERVED-REVISION"}'
```

## Diagnostics

See the app's status, or save the package described in [Get help](troubleshooting.md#get-help):

```bash
putgd-cli diagnostics
putgd-cli diagnostics.bundle --since 7d
```

`diagnostics.bundle` also takes `--operation ID`, `--include-names`, `--output PATH`, `--upload`, `--profile ID` and `--copy-link`.

## Other commands

| Area | Methods |
| --- | --- |
| Work in progress | `operation.cancel`, `operation.retry`, `operation.retryLocalSave` |
| Editor | `editor.open`, `editor.inspect`, `editor.apply`, `editor.copy`, `editor.cancel` |
| Recording | `recording.prepare`, `recording.microphones`, `recording.windows`, `recording.stop`, `recording.upload`, `recording.inspect` |
| History | `history.detail`, `history.counts`, `history.openLink`, `delete.prepare`, `delete.confirm` |
| Destinations | `setup.testDestination`, `setup.inspect` |
| App | `desktop.setup`, `update.status`, `update.check`, `ui.quit` |

`history.copyLink` renews an [expired link](history.md#when-a-link-expires) before copying it. `recording.prepare` records the microphone when you pass `"audio":{"microphone":true}`.

The [full method list](https://github.com/patrick-hudson/put.gd-desktop/blob/nightly/docs/automation/cli.md) gives every parameter. Some of these arrived after the last stable release; see [stable or nightly](index.md#stable-or-nightly).

## Read the reply

Each command prints one JSON object. Check `ok`. When it is `false`, `error.code` and `error.message` say why. For example, `session_unavailable` means put.gd isn't running in this session.

!!! warning "Exit 0 doesn't mean the upload finished"
    It means the request was accepted. Follow the `operationId` with `operation.inspect` until you see the outcome. If a command times out, check `operation.recent` before trying again, because the first request may still finish.

## MCP for agents

An optional MCP server gives agents the same actions as typed tools, including `upload_files`. It needs Python 3.12 or newer and `uv`, never starts put.gd for you, and comes from a checkout of the [desktop repository](https://github.com/patrick-hudson/put.gd-desktop). From the top of that checkout:

```bash
uv sync --project tools/mcp --locked
uv run --project tools/mcp --locked putgd-mcp --cli /usr/bin/putgd-cli
```
