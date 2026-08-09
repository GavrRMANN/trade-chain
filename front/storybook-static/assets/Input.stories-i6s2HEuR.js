import{r as h,j as u}from"./iframe-BCyKHs7D.js";import{C as v}from"./Control.module-CmF-qhzo.js";import{L as _}from"./Label-C5x8OV_c.js";import"./preload-helper-PPVm8Dsz.js";const q="_input_1dau5_1",t={input:q,"input--disabled":"_input--disabled_1dau5_15","input--error":"_input--error_1dau5_41"},n=h.forwardRef(({label:l,name:p,value:d="",placeholder:c,onChange:m,error:o,disabled:s=!1,loading:i=!1},f)=>{const g=[t.input,v.text,(s||i)&&t["input--disabled"],o?.showError&&t["input--error"]].filter(Boolean).join(" "),y=b=>{m?.(b.target.value)};return u.jsx(_,{label:l,error:o,disabled:s,children:u.jsx("input",{className:g,defaultValue:d,name:p,placeholder:c,disabled:s||i,onChange:y,ref:f})})});n.displayName="Input";n.__docgenInfo={description:"",methods:[],displayName:"Input",props:{label:{required:!1,tsType:{name:"string"},description:""},name:{required:!1,tsType:{name:"string"},description:""},value:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},placeholder:{required:!1,tsType:{name:"string"},description:""},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},error:{required:!1,tsType:{name:"signature",type:"object",raw:`{
    showError: boolean;
    errorMessage: string;
}`,signature:{properties:[{key:"showError",value:{name:"boolean",required:!0}},{key:"errorMessage",value:{name:"string",required:!0}}]}},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},loading:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const j={title:"Shared/Input",component:n,args:{label:"Название",value:"Велосипед",placeholder:"Введите название"}},e={},r={args:{disabled:!0}},a={args:{value:"",error:{showError:!0,errorMessage:"Поле обязательно"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    value: '',
    error: {
      showError: true,
      errorMessage: 'Поле обязательно'
    }
  }
}`,...a.parameters?.docs?.source}}};const C=["Default","Disabled","Error"];export{e as Default,r as Disabled,a as Error,C as __namedExportsOrder,j as default};
