
import type FloatingToc from "src/main";
import { App, requireApiVersion, MarkdownView,Component, HeadingCache,MarkdownRenderer } from "obsidian";


export async function renderHeader(
        source: string,
        container?: HTMLElement,
        notePath?: string,
        component: Component = null
    ) {
  
        let subcontainer = container
        await MarkdownRenderer.renderMarkdown(
            source,
            subcontainer,
            notePath,
            component
        );
        let atag = subcontainer.createEl("a");
        atag.addClass("text")
        let par = subcontainer.querySelector("p");
        if (par) {
            atag.innerHTML= par.innerHTML
           subcontainer.removeChild(par);
        }
    }

export async function createli(view: MarkdownView, ul_dom: HTMLElement, heading: HeadingCache, index: number) {
    let li_dom = ul_dom.createEl("li")
    li_dom.addClass("heading-list-item")
    li_dom.setAttribute("data-level", heading.level.toString())
    li_dom.setAttribute("data-id", index.toString())
    li_dom.setAttribute("data-line", heading.position.start.line.toString())
    li_dom.onclick = function (event) {
        let startline = parseInt(li_dom.getAttribute("data-line")) ?? 0
        if (event.ctrlKey) {
            foldheader(view, startline)
        } else {
            openFileToLine(view, startline)
        }
    }

    let text_dom = li_dom.createEl("div")
    text_dom.addClass("text-wrap")
   // let text = text_dom.createEl("a")
    //text.addClass("text")
    renderHeader(heading.heading,text_dom,view.file.path,null)
   // text.innerHTML = heading.heading
    let line_dom = li_dom.createEl("div")
    line_dom.addClass("line-wrap")
    line_dom.createDiv().addClass("line")
}

const openFileToLine = (view: MarkdownView, lineNumber: number) => {
    //const current_file = plugin.app.workspace.getActiveFile()
    //     console.log("line number", lineNumber);
   // let leaf = plugin.app.workspace.getLeaf(false);
    view.leaf.openFile(view.file, {
        eState: { line: lineNumber },
    });
};
const foldheader = (view: MarkdownView, startline: number) => {
   // const view = plugin.app.workspace.getActiveViewOfType(MarkdownView)
    const existingFolds = view?.currentMode.getFoldInfo()?.folds ?? [];
    const headfrom = startline
    let index = 0;
    if (existingFolds.some((item, idx) => { index = idx; return item.from == headfrom })) //标题原来已经折叠状态
        existingFolds.splice(index, 1); //删除折叠状态
    else {
        let headingsAtLevel = {
            from: startline,
            to: startline + 1,
        }
        existingFolds.push(headingsAtLevel);
    }

    view?.currentMode.applyFoldInfo({
        folds: existingFolds,
        lines: view.editor.lineCount(),
    });
    view?.onMarkdownFold();
}

export function CreatToc(
    app: App,
    plugin: FloatingToc
): void {

    const genToc =  (currentleaf:HTMLElement, floatingTocWrapper: HTMLDivElement) => {

        if (plugin.settings.positionStyle == "right")
        floatingTocWrapper.addClass("floating-right"), floatingTocWrapper.removeClass("floating-left")
    else if (plugin.settings.positionStyle == "left")
    floatingTocWrapper.addClass("floating-left"), floatingTocWrapper.removeClass("floating-rigth")
        let ul_dom = floatingTocWrapper.createEl("ul")
        ul_dom.addClass("floating-toc")
        const current_file = app.workspace.getActiveFile()
        globalThis.headingdata = app.metadataCache.getFileCache(current_file).headings
        if (globalThis.headingdata) {
            globalThis.headingdata.forEach((heading: HeadingCache, index: number) => {
                const view = app.workspace.getActiveViewOfType(MarkdownView)
                createli(view, ul_dom, heading, index)
            });

            currentleaf
                ?.querySelector(".markdown-source-view")
                .insertAdjacentElement("beforebegin", floatingTocWrapper);
        }

    };
    let Markdown = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (Markdown) {
        requireApiVersion("0.15.0") ? activeDocument = activeWindow.document : activeDocument = window.document;
        let view=plugin.app.workspace.getActiveViewOfType(MarkdownView)
        let float_toc_dom = view.contentEl?.querySelector(".floating-toc-div");

        if (!float_toc_dom) {
            const floatingTocWrapper = createEl("div");
            floatingTocWrapper.addClass("floating-toc-div");

            genToc(view.contentEl, floatingTocWrapper)
        } else return;
    }

}