using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace XsdToCode.Example.Tests.AbstractClasses
{

    public class Employees
    {

        [XmlElement(type: typeof(Developer), elementName: "Developer")]
        [XmlElement(type: typeof(EmployeeBase.Manager), elementName: "Manager")]
        [XmlElement(type: typeof(EmployeeBase), elementName: "Employee")]
        public List<EmployeeBase> EmployeeBaseList { get; set; }
    }

}
