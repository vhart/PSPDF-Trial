import React, { Component } from "react";
import PSPDFKitWeb from "pspdfkit";
import axios from "axios"
const { InkAnnotation, toSerializableObject } = PSPDFKitWeb.Annotations;
// https://pspdfkit.com/guides/web/current/importing-exporting/instant-json/
// https://pspdfkit.com/guides/web/current/annotations/annotation-saving-mechanism/

/**
 * https://pspdfkit.com/guides/web/current/importing-exporting/instant-json/
 * There are some limitations with Instant JSON, in that not all annotation types are currently supported, 
 * and only the properties that can be handled correctly across all of PSPDFKit’s supported platforms (iOS, Android, and Web) are serialized. 
 * For more information, check out the detailed JSON Format guide article.
 */
function isEmpty(obj) {
  for(var key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}

export default class PSPDFKit extends Component {
  constructor(props, context) {
    super(props, context);
    this._instance = null;
    this._container = null;

    this.onRef = this.onRef.bind(this);
    this.load = this.load.bind(this);
    this.unload = this.unload.bind(this);
  }

  onRef(container) {
    this._container = container;
  }

  async load(props) {
    console.log(`Loading ${props.pdfUrl}`);
    const self = this
    const response = await axios.get("http://localhost:8081")
    const data = response.data
    console.log(data)

    if (isEmpty(data)) {
      this._instance = await PSPDFKitWeb.load({
        pdf: props.pdfUrl,
        container: this._container,
        licenseKey: props.licenseKey,
        baseUrl: props.baseUrl
      });
    } else {
      this._instance = await PSPDFKitWeb.load({
        pdf: props.pdfUrl,
        container: this._container,
        licenseKey: props.licenseKey,
        baseUrl: props.baseUrl,
        responseType: 'jsonp',
        instantJSON: data
      });
    }
  

    this._instance.setToolbarItems(items => {
      const aCustomItem = {
        type: "custom",
        id: "save-document",
        title: "SAVE",
        onPress: event => {
          self.save()
        }
      };
      items.push(aCustomItem);
      return items;
    });

    this._instance.addEventListener("annotations.create", (createdAnnotations) => {
      console.log("annotations.create")

      console.log(createdAnnotations)
    })

    this._instance.addEventListener("annotations.delete", (annotation) => {
      console.log(`annotations.delete`)
      console.log(annotation.toSerializableObject())
    })

    this._instance.addEventListener("annotations.didSave", async () => {
      console.log(`annotations.didSave`)
    });

    console.log("Successfully mounted PSPDFKit", this._instance);
  }

  async save() {
    const instantJSON = await this._instance.exportInstantJSON();

    console.log(`annotations.didSave`)
    console.log(instantJSON)
    axios({
      method: 'post',
      url: 'http://localhost:8081',
      headers: {
        "Content-Type": "application/json"
      },
      data: instantJSON
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  unload() {
    PSPDFKitWeb.unload(this._instance || this._container);
    this._instance = null;
  }

  componentDidMount() {
    this.load(this.props);
  }

  componentDidUpdate(prevProps) {
    const nextProps = this.props;
    // We only want to reload the document when the pdfUrl prop changes.
    if (nextProps.pdfUrl !== prevProps.pdfUrl) {
      this.unload();
      this.load(nextProps);
    }
  }

  componentWillUnmount() {
    this.unload();
  }

  render() {
    return (
      <div
        ref={this.onRef}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />
    );
  }
}
