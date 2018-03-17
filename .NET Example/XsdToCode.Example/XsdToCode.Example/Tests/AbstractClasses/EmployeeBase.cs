using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace XsdToCode.Example.Tests.AbstractClasses
{

    [XmlInclude(typeof(Developer))]
    [XmlInclude(typeof(Manager))]
    public class EmployeeBase
    {
        [XmlAttribute(attributeName: "name")]
        public string Name { get; set; }

        public class Manager : EmployeeBase
        {
            [XmlAttribute(attributeName: "age")]
            public int Age { get; set; }
        }

    }


}
