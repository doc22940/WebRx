﻿/// <reference path="../Interfaces.ts" />

import {  formatString } from "../Core/Utils"

"use strict";

let templateCache: { [key: string]: any } = {};

export default class SelectComponent implements wx.IComponentDescriptor {
    constructor(htmlTemplateEngine: wx.ITemplateEngine) {
        this.htmlTemplateEngine = htmlTemplateEngine;
    }

    public template = (params: any): Node[]=> {
        return this.buildTemplate(params);
    }

    public viewModel = (params: any): any => {
        let opt = <wx.ISelectComponentParams> params;

        return {
            items: params.items,
            selectedValue: params.selectedValue,
            hooks: { afterRender: opt.afterRender }
        };
    }

    ////////////////////
    // Implementation

    htmlTemplateEngine: wx.ITemplateEngine;

    protected buildTemplate(params: wx.ISelectComponentParams): Node[] {
        let result: string;
        let key: string = undefined;
        let nodes: Node[];

        // check cache
        if (!params.noCache) {
            key = (params.name != null ? params.name : "") + "-" +
                (params.itemText != null ? params.itemText : "") + "-" +
                (params.itemValue != null ? params.itemValue : "") + "-" +
                (params.itemClass != null ? params.itemClass : "") + "-" +
                (params.selectedValue != null ? "true" : "false") + "-" +
                (params.multiple ? "true" : "false") + "-" +
                (params.required ? "true" : "false") + "-" +
                (params.autofocus ? "true" : "false") + "-" +
                (params.size ? params.size.toString() : "0");

            nodes = templateCache[key];

            if (nodes != null) {
                //console.log("cache hit", key, result);
                return nodes;
            }
        }

        // base-template
        result = '<select class="wx-select" data-bind="{0}"><option data-bind="{1}"></option></select>';
        let bindings: Array<{ key: string; value: string }> = [];
        let attrs: Array<{ key: string; value: string }> = [];
        let itemBindings: Array<{ key: string; value: string }> = [];
        let itemAttrs: Array<{ key: string; value: string }> = [];

        bindings.push({ key: "foreach", value: "{ data: items, hooks: hooks }" });

        // selection (two-way)
        if (params.selectedValue)
            bindings.push({ key: "selectedValue", value: "@selectedValue" });

        // name
        if (params.name) {
            attrs.push({ key: 'name', value: params.name });
        }

        // multi-select
        if (params.multiple) {
            attrs.push({ key: 'multiple', value: "true" });
        }

        // size
        if (params.size !== undefined) {
            attrs.push({ key: 'size', value: params.size.toString() });
        }

        // required
        if (params.required) {
            attrs.push({ key: 'required', value: "true" });
        }

        // required
        if (params.autofocus) {
            attrs.push({ key: 'autofocus', value: "true" });
        }

        // assemble attr-binding
        if (attrs.length)
            bindings.push({ key: "attr", value: "{ " + attrs.map(x => x.key + ": " + x.value).join(", ") + " }" });

        // value
        itemBindings.push({ key: "value", value: params.itemValue || "$data" });

        // label
        itemBindings.push({ key: 'text', value: params.itemText || "$data" });

        // per-item css class
        if (params.itemClass) {
            itemAttrs.push({ key: 'class', value: "'" + params.itemClass + "'" });
        }

        // assemble attr-binding
        if (itemAttrs.length)
            itemBindings.push({ key: "attr", value: "{ " + itemAttrs.map(x => x.key + ": " + x.value).join(", ") + " }" });

        // assemble all bindings
        let bindingString = bindings.map(x => x.key + ": " + x.value).join(", ");
        let itemBindingString = itemBindings.map(x => x.key + ": " + x.value).join(", ");

        // assemble template
        result = formatString(result, bindingString, itemBindingString);
        //console.log(result);

        // store
        if (!params.noCache) {
            templateCache[key] = result;
        }

        // app.templateEngine can be altered by developer therefore we make sure to parse using HtmlTemplateEngine
        nodes = this.htmlTemplateEngine.parse(result);
        return nodes;
    }
}
