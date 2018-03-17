using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace XsdToCode.Example.Tests.AbstractClasses
{

    public class Developer : EmployeeBase
    {
        [XmlAttribute(attributeName: "skill")]
        public int Skill { get; set; }

        [XmlIgnore]
        public bool ShouldSerializeSkill { get { return true; } set { } }
    }

}
