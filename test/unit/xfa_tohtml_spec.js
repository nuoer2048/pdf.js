/* Copyright 2020 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { XFAFactory } from "../../src/core/xfa/factory.js";

describe("XFAFactory", function () {
  describe("toHTML", function () {
    it("should convert some basic properties to CSS", function () {
      const xml = `
<?xml version="1.0"?>
<xdp:xdp xmlns:xdp="http://ns.adobe.com/xdp/">
  <template xmlns="http://www.xfa.org/schema/xfa-template/3.3">
    <subform name="root" mergeMode="matchTemplate">
      <pageSet>
        <pageArea>
          <contentArea x="123pt" w="456pt" h="789pt"/>
          <medium stock="default" short="456pt" long="789pt"/>
          <draw y="1pt" w="11pt" h="22pt" rotate="90" x="2pt">
            <font size="7pt" typeface="FooBar" baselineShift="2pt">
              <fill>
                <color value="12,23,34"/>
                <solid/>
              </fill>
            </font>
            <value/>
            <margin topInset="1pt" bottomInset="2pt" leftInset="3pt" rightInset="4pt"/>
            <para spaceAbove="1pt" spaceBelow="2pt" textIndent="3pt" marginLeft="4pt" marginRight="5pt"/>
          </draw>
        </pageArea>
      </pageSet>
      <subform name="first">
      </subform>
      <subform name="second">
        <breakBefore targetType="pageArea" startNew="1"/>
      </subform>
    </subform>
  </template>
  <xfa:datasets xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/">
    <xfa:data>
    </xfa:data>
  </xfa:datasets>
</xdp:xdp>
      `;
      const factory = new XFAFactory({ "xdp:xdp": xml });

      expect(factory.numberPages).toEqual(2);

      const pages = factory.getPages();
      const page1 = pages.children[0];
      expect(page1.attributes.style).toEqual({
        height: "789px",
        width: "456px",
      });

      expect(page1.children.length).toEqual(2);
      const container = page1.children[0];
      expect(container.attributes.class).toEqual(["xfaContentarea"]);
      expect(container.attributes.style).toEqual({
        height: "789px",
        width: "456px",
        left: "123px",
        top: "0px",
        position: "absolute",
      });

      const wrapper = page1.children[1];
      const draw = wrapper.children[0];

      expect(wrapper.attributes.class).toEqual(["xfaWrapper"]);
      expect(wrapper.attributes.style).toEqual({
        alignSelf: "start",
        height: "22px",
        left: "2px",
        position: "absolute",
        top: "1px",
        transform: "rotate(-90deg)",
        transformOrigin: "top left",
        width: "11px",
      });

      expect(draw.attributes.class).toEqual([
        "xfaDraw",
        "xfaFont",
        "xfaWrapped",
      ]);
      expect(draw.attributes.style).toEqual({
        color: "#0c1722",
        fontFamily: "FooBar",
        fontSize: "6.93px",
        margin: "1px 4px 2px 3px",
        verticalAlign: "2px",
      });

      // draw element must be on each page.
      expect(draw.attributes.style).toEqual(
        pages.children[1].children[1].children[0].attributes.style
      );
    });
  });
});
