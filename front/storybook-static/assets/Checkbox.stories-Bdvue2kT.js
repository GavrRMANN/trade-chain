import{r as g,j as c}from"./iframe-BCyKHs7D.js";import{L as k}from"./Label-C5x8OV_c.js";import"./preload-helper-PPVm8Dsz.js";import"./Control.module-CmF-qhzo.js";const x="_checkbox_whjzl_1",i={checkbox:x,"checkbox--error":"_checkbox--error_whjzl_61"},s=g.forwardRef(({name:d,label:l,disabled:n=!1,error:a,checked:t,onChange:p},u)=>{const m=[i.checkbox,a?.showError&&i["checkbox--error"]].filter(Boolean).join(" "),h=b=>{p?.(b.target.checked)};return c.jsx(k,{label:l,error:a,disabled:n,role:"checkbox","aria-checked":t,children:c.jsx("input",{ref:u,type:"checkbox",className:m,disabled:n,name:d,checked:t,onChange:h,"aria-invalid":!!a})})});s.displayName="Checkbox";s.__docgenInfo={description:"",methods:[],displayName:"Checkbox",props:{name:{required:!1,tsType:{name:"string"},description:""},label:{required:!1,tsType:{name:"string"},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},error:{required:!1,tsType:{name:"signature",type:"object",raw:`{
    showError: boolean;
    errorMessage: string;
}`,signature:{properties:[{key:"showError",value:{name:"boolean",required:!0}},{key:"errorMessage",value:{name:"string",required:!0}}]}},description:""},checked:{required:!0,tsType:{name:"boolean"},description:""},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"value"}],return:{name:"void"}}},description:""}}};const E={title:"Shared/Checkbox",component:s,args:{label:"Получать уведомления",checked:!0}},e={},r={args:{disabled:!0}},o={args:{checked:!1,error:{showError:!0,errorMessage:"Подтвердите согласие"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    checked: false,
    error: {
      showError: true,
      errorMessage: 'Подтвердите согласие'
    }
  }
}`,...o.parameters?.docs?.source}}};const _=["Checked","Disabled","Error"];export{e as Checked,r as Disabled,o as Error,_ as __namedExportsOrder,E as default};
