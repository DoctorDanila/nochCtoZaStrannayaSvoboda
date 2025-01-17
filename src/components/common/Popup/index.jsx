import React, { useState, useImperativeHandle } from "react";
import { Icon, Modal, ThemeProvider } from "@gravity-ui/uikit";
import { ArrowLeft, Xmark } from "@gravity-ui/icons";
import "./style.scss";

const Popup = React.forwardRef((props, ref) => {
  const theme = {
    width: "410px",
    height: "auto",
    borderRadius: "30px",
    margin: "20px 20px 20px auto",
    boxShadow: "0px 4px 20px 0px #2713004D",
    backdropFilter: "blur(20px)",
  };
  const [step, setStep] = React.useState(props.step ? props.step : 1);
  let multyStep = props.multyStep ? true : false;
  let isOrder = props.order ? true : false;
  const [title, setTitle] = useState(
    !multyStep && props.title
      ? props.title
      : props.children[step - 1].props.title,
  );

  useImperativeHandle(ref, () => ({
    handleNextStep() {
      if (step < props.children.length) {
        setStep((prevStep) => prevStep + 1);
        setTitle(props.children[step].props.title || "");
      }
    },
    handlePrevStep() {
      if (step > 1 && step <= props.children.length) {
        setStep((prevStep) => prevStep - 1);
        setTitle(props.children[step - 2].props.title || "");
      }
    },
    setVoluntaryStep(s) {
      if (s > 1 && s <= props.children.length) {
        setStep(s);
        setTitle(props.children[s - 1].props.title || "");
      }
    },
    handleClose() {
      props.onClose();
    },
  }));
  function handlePrevStep() {
    if (step > 1 && step <= props.children.length) {
      setStep((prevStep) => prevStep - 1);
      setTitle(props.children[step - 2].props.title || props.title || "");
    }
  }
  function toStart() {
    setStep(1);
    setTitle(props.children[0].props.title || "");
  }

  return (
    <ThemeProvider>
      <Modal open={props.open} onClose={props.onClose} style={theme}>
        <div className="popup-header">
          <div
            className="back-container"
            onClick={isOrder ? handlePrevStep : toStart}
          >
            {multyStep && step > 1 && <Icon data={ArrowLeft} size={24} />}
          </div>
          <div className="title-container">{title}</div>
          <div onClick={props.onClose} className="close-container">
            <Icon data={Xmark} size={24} />
          </div>
        </div>
        {multyStep
          ? props.children.map((item, index) => index === step - 1 && item)
          : props.children}
      </Modal>
    </ThemeProvider>
  );
});

export default Popup;
