using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;

namespace XsdToCode.Example.Extensions
{
    static class ObjectSerializationExtension
    {
        public static string Serialize(this object o)
        {
            string xml = null;
            if (o != null)
            {
                var serializer = new XmlSerializer(o.GetType());
                using (var sw = new StringWriter())
                {
                    using (XmlWriter xw = XmlWriter.Create(sw, new XmlWriterSettings
                    {
                        Indent = true
                    }))
                    {
                        serializer.Serialize(xw, o);
                        xml = sw.ToString();
                    }
                }
            }
            return xml;
        }
    }


}
