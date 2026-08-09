import{r as h,j as i}from"./iframe-BCyKHs7D.js";import{L as y}from"./Label-C5x8OV_c.js";import"./preload-helper-PPVm8Dsz.js";import"./Control.module-CmF-qhzo.js";const b="_radio_1p3w7_1",d={radio:b,"radio--error":"_radio--error_1p3w7_61"},s=h.forwardRef(({name:c,label:l,disabled:n=!1,error:o,checked:t,onChange:p},u)=>{const m=[d.radio,o?.showError&&d["radio--error"]].filter(Boolean).join(" "),g=f=>{p?.(f.target.checked)};return i.jsx(y,{label:l,disabled:n,error:o,position:"after",role:"checkbox","aria-checked":t,children:i.jsx("input",{ref:u,type:"radio",className:m,disabled:n,name:c,checked:t,onChange:g,"aria-invalid":!!o})})});s.displayName="Radio";s.__docgenInfo={description:"",methods:[],displayName:"Radio",props:{name:{required:!1,tsType:{name:"string"},description:""},label:{required:!1,tsType:{name:"string"},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},error:{required:!1,tsType:{name:"signature",type:"object",raw:`{
    showError: boolean;
    errorMessage: string;
}`,signature:{properties:[{key:"showError",value:{name:"boolean",required:!0}},{key:"errorMessage",value:{name:"string",required:!0}}]}},description:""},checked:{required:!0,tsType:{name:"boolean"},description:""},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"value"}],return:{name:"void"}}},description:""}}};const v={title:"Shared/Radio",component:s,args:{label:"Самовывоз",checked:!0,name:"delivery"}},e={},r={args:{disabled:!0}},a={args:{checked:!1,error:{showError:!0,errorMessage:"Выберите способ доставки"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    checked: false,
    error: {
      showError: true,
      errorMessage: 'Выберите способ доставки'
    }
  }
}`,...a.parameters?.docs?.source}}};const q=["Checked","Disabled","Error"];export{e as Checked,r as Disabled,a as Error,q as __namedExportsOrder,v as default};
